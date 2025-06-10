import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import { pullGacha, ShopItem } from '@/store/slices/shopSlice';
import { showNotification } from '@/store/slices/notificationSlice';
import { motion, AnimatePresence } from 'framer-motion';

const ShopPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const diamonds = useAppSelector(state => state.user.diamonds);
  const gold = useAppSelector(state => state.user.gold);
  const [tab, setTab] = useState<'plant' | 'animal'>('plant');
  const [isPulling, setIsPulling] = useState(false);
  const [gachaResult, setGachaResult] = useState<ShopItem[]>([]);
  const [showResult, setShowResult] = useState(false);

  // 가챠 실행 핸들러
  const handleGacha = async (type: 'single' | 'multi', currency: 'gold' | 'diamond') => {
    setIsPulling(true);
    setGachaResult([]); // 이전 결과 초기화
    try {
      const results = await dispatch(pullGacha({ category: tab, gachaType: type, currency }));

      if (results && results.length > 0) {
        setGachaResult(results);
        setShowResult(true);
        dispatch(showNotification({ message: t('gachaSuccess', { count: results.length }), type: 'success' }));
      } else {
        dispatch(showNotification({ message: t('gachaFailed'), type: 'error' }));
      }
    } catch (e: any) {
      dispatch(showNotification({ message: e.message || t('unexpectedError'), type: 'error' }));
    } finally {
      setIsPulling(false);
    }
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'uncommon':
        return 'border-green-500';
      case 'rare':
        return 'border-blue-500';
      case 'epic':
        return 'border-purple-500';
      case 'legendary':
        return 'border-yellow-500';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto font-sans">
      <motion.h1 
        className="text-4xl font-bold mb-8 text-center text-stone-800"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {t('shop')}
      </motion.h1>

      <div className="mb-6 flex justify-center gap-4">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setTab('plant')} className={`px-6 py-3 rounded-full font-semibold text-lg transition-colors ${tab === 'plant' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-emerald-700 shadow-md'}`}>{t('plantGacha')}</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setTab('animal')} className={`px-6 py-3 rounded-full font-semibold text-lg transition-colors ${tab === 'animal' ? 'bg-sky-600 text-white shadow-lg' : 'bg-white text-sky-700 shadow-md'}`}>{t('animalGacha')}</motion.button>
      </div>
      
      <motion.div 
        key={tab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200"
      >
        <div className="flex items-center justify-center gap-6 mb-6 text-xl font-semibold text-stone-700">
          <span className="flex items-center gap-2">💎 <span className="text-blue-500">{diamonds}</span> {t('diamonds')}</span>
          <span className="flex items-center gap-2">💰 <span className="text-yellow-600">{gold}</span> {t('coins')}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={isPulling || gold < 500} onClick={() => handleGacha('single', 'gold')} className="px-4 py-3 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 disabled:bg-gray-400 shadow-md transition-colors">{t('singlePull')} (500G)</motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={isPulling || gold < 4500} onClick={() => handleGacha('multi', 'gold')} className="px-4 py-3 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 disabled:bg-gray-400 shadow-md transition-colors">{t('multiPull')} (4500G)</motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={isPulling || diamonds < 100} onClick={() => handleGacha('single', 'diamond')} className="px-4 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 disabled:bg-gray-400 shadow-md transition-colors">{t('singlePull')} (100💎)</motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={isPulling || diamonds < 900} onClick={() => handleGacha('multi', 'diamond')} className="px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 shadow-md transition-colors">{t('multiPull')} (900💎)</motion.button>
        </div>
        <div className="text-center text-md text-gray-600 min-h-[24px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={tab}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {tab === 'plant' && t('plantGachaDescription')}
              {tab === 'animal' && t('animalGachaDescription')}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {showResult && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-2xl p-6 w-full max-w-2xl relative"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">{t('gachaResults')}</h2>
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
                initial="hidden"
                animate="show"
              >
                {gachaResult.map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    className={`flex flex-col items-center p-3 border-4 rounded-xl bg-white shadow-md ${getRarityColor(item.rarity)}`}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 }
                    }}
                  >
                    <motion.div 
                      className="text-5xl mb-2 drop-shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 * idx + 0.3, type: 'spring', stiffness: 400, damping: 10 }}
                    >
                      {item.emoji || '🎁'}
                    </motion.div>
                    <div className="font-semibold text-center text-sm text-gray-800">{item.name}</div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{item.rarity || 'common'}</div>
                  </motion.div>
                ))}
              </motion.div>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={() => setShowResult(false)} 
                className="block mx-auto px-8 py-3 bg-green-500 text-white rounded-full font-bold text-lg shadow-lg"
              >
                {t('close', 'Close')}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopPage;
