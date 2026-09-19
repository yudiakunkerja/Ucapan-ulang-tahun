import React, { useState, useEffect } from 'react';
import { GreetingCard, RecipientResponse } from './types';
import { INITIAL_CARDS } from './data/themes';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { RecipientCardView } from './components/RecipientCardView';

const STORAGE_KEY = 'birthday_cards_data_v1';
const THEME_STORAGE_KEY = 'birthday_theme_dark_mode_v1';

export default function App() {
  // Cards State with localStorage persistence
  const [cards, setCards] = useState<GreetingCard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore parsing errors
    }
    return INITIAL_CARDS;
  });

  // Current active card for Recipient View
  const [activeCardId, setActiveCardId] = useState<string>(() => {
    // Check URL search params for ?card=...
    const urlParams = new URLSearchParams(window.location.search);
    const cardParam = urlParams.get('card');
    if (cardParam) return cardParam;
    return INITIAL_CARDS[0]?.id || '';
  });

  // View mode: 'dashboard' (Website Pengaturan) vs 'recipient' (Website Tampilan Ucapan)
  const [currentView, setCurrentView] = useState<'dashboard' | 'recipient'>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('card')) {
      return 'recipient';
    }
    return 'dashboard';
  });

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // Ignore
    }
    return false; // Default to sophisticated, clean light palette
  });

  // Apply dark mode class to <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, String(isDarkMode));
    } catch {
      // Ignore
    }
  }, [isDarkMode]);

  // Persist cards
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch {
      // Ignore
    }
  }, [cards]);

  // Handle URL change or popstate
  useEffect(() => {
    const handleLocation = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const cardParam = urlParams.get('card');
      if (cardParam) {
        const found = cards.find((c) => c.id === cardParam);
        if (found) {
          setActiveCardId(cardParam);
          setCurrentView('recipient');
        }
      }
    };

    window.addEventListener('popstate', handleLocation);
    return () => window.removeEventListener('popstate', handleLocation);
  }, [cards]);

  // Save / Update card
  const handleSaveCard = (updatedCard: GreetingCard) => {
    setCards((prev) => {
      const exists = prev.some((c) => c.id === updatedCard.id);
      if (exists) {
        return prev.map((c) => (c.id === updatedCard.id ? updatedCard : c));
      } else {
        return [updatedCard, ...prev];
      }
    });
    setActiveCardId(updatedCard.id);
  };

  // Delete card
  const handleDeleteCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    if (activeCardId === id) {
      const remaining = cards.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        setActiveCardId(remaining[0].id);
      }
    }
  };

  // Preview card as recipient
  const handlePreviewCard = (card: GreetingCard) => {
    handleSaveCard(card);
    setActiveCardId(card.id);
    setCurrentView('recipient');
    // Update URL query param quietly
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('card', card.id);
    window.history.pushState({}, '', newUrl.toString());
  };

  // Add recipient's response
  const handleAddResponse = (cardId: string, response: RecipientResponse) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          return {
            ...c,
            responses: [response, ...(c.responses || [])],
          };
        }
        return c;
      })
    );
  };

  // Find active card for recipient view
  const currentCard = cards.find((c) => c.id === activeCardId) || cards[0];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 font-sans">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onSelectView={(view) => {
          setCurrentView(view);
          if (view === 'dashboard') {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('card');
            window.history.pushState({}, '', newUrl.toString());
          }
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        hasActiveRecipientCard={!!currentCard}
      />

      {/* Main View Switcher */}
      <div className="flex-1 flex flex-col">
        {currentView === 'dashboard' ? (
          <DashboardView
            cards={cards}
            onSaveCard={handleSaveCard}
            onDeleteCard={handleDeleteCard}
            onPreviewCard={handlePreviewCard}
          />
        ) : currentCard ? (
          <RecipientCardView
            card={currentCard}
            onBackToDashboard={() => {
              setCurrentView('dashboard');
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.delete('card');
              window.history.pushState({}, '', newUrl.toString());
            }}
            onAddResponse={handleAddResponse}
          />
        ) : (
          <div className="p-12 text-center">
            <p className="text-zinc-500">Kartu tidak ditemukan.</p>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold"
            >
              Kembali ke Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
