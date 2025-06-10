import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import { plantCrop, harvestPlot, sellItem, collectProduct } from '@/store/slices/farmSlice';
import { CROP_DEFINITIONS, ANIMAL_DEFINITIONS, SHOP_ITEMS } from '@/constants/farm';
import { motion, AnimatePresence } from 'framer-motion';

const getEmoji = (itemId: string): string => {
  const crop = CROP_DEFINITIONS[itemId];
  if (crop) return crop.emoji;

  const animalDef = ANIMAL_DEFINITIONS[itemId];
  if (animalDef) return animalDef.emoji;

  const shopItem = SHOP_ITEMS[itemId];
  if (shopItem && shopItem.emoji) {
    return shopItem.emoji;
  }

  return '❓';
};

const FarmPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { plots, animals, inventory } = useAppSelector((state) => state.farm);
  const gold = useAppSelector((state) => state.user.gold);

  const [selectedTab, setSelectedTab] = useState<'farm' | 'animals' | 'inventory'>('farm');
  const [plantingPlotId, setPlantingPlotId] = useState<string | null>(null);

  const handlePlant = (seedId: string) => {
    if (plantingPlotId) {
      dispatch(plantCrop({ plotId: plantingPlotId, seedId }));
      setPlantingPlotId(null);
    }
  };

  const availableSeeds = useMemo(() => {
    return Object.values(inventory).filter(item => item.itemId.endsWith('_seed'));
  }, [inventory]);

  const renderFarmPlots = () => (
    <div className="p-4 bg-green-200/50 rounded-2xl shadow-inner">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {plots.map((plot) => {
          const crop = plot.cropId ? CROP_DEFINITIONS[plot.cropId] : null;
          const isReady = crop && plot.growthProgress >= 100;
          const progress = crop ? plot.growthProgress : 0;

          return (
            <motion.div
              key={plot.id}
              className="relative p-4 bg-white/60 rounded-xl shadow-lg text-center flex flex-col items-center justify-center aspect-square"
              whileHover={{ scale: 1.05 }}
            >
              {crop ? (
                <>
                  <div className="text-5xl mb-2 drop-shadow-lg">{isReady ? crop.emoji : '🌱'}</div>
                  <span className="font-bold text-gray-800">{t(crop.name)}</span>
                  {isReady ? (
                    <motion.button
                      onClick={() => dispatch(harvestPlot({ plotId: plot.id }))}
                      className="mt-2 px-4 py-2 bg-green-500 text-white rounded-full font-semibold shadow-md"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {t('harvest')}
                    </motion.button>
                  ) : (
                    <>
                      <div className="w-full mt-2 h-3 bg-gray-200 rounded-full border border-gray-300">
                        <div className="h-full bg-green-400 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{t('growing')}</p>
                    </>
                  )}
                </>
              ) : (
                <motion.button
                  onClick={() => setPlantingPlotId(plot.id)}
                  className="w-full h-full flex flex-col items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="text-4xl text-gray-400">+</div>
                  <p className="text-sm text-gray-600">{t('plant')}</p>
                </motion.button>
              )}
            </motion.div>
          );
        })}
        {plots.length === 0 && <p className="col-span-full text-center text-gray-500 p-8">{t('noPlots')}</p>}
      </div>
    </div>
  );

  const renderAnimals = () => (
    <div className="p-4 bg-sky-200/50 rounded-2xl shadow-inner">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {animals.map((animal) => {
                const animalData = ANIMAL_DEFINITIONS[animal.type];
                if (!animalData) return null;
                
                const isReady = !!animal.productReadyAt;
                const lastFed = animal.lastFed || 0;
                const productionTime = animalData.product.productionTime * 1000;
                const progress = isReady ? 100 : Math.min(100, ((Date.now() - lastFed) / productionTime) * 100);
                const timeLeft = productionTime - (Date.now() - lastFed);

                return (
                  <motion.div
                    key={animal.id}
                    className="relative p-4 bg-white/60 rounded-xl shadow-lg text-center flex flex-col items-center justify-center aspect-square"
                    whileHover={{ scale: 1.05 }}
                  >
                      <div className="text-5xl mb-2 drop-shadow-lg">{getEmoji(animal.type)}</div>
                      <span className="font-bold text-gray-800">{t(animalData.name)}</span>
                      
                      {isReady ? (
                          <motion.button 
                            onClick={() => dispatch(collectProduct({ animalId: animal.id }))} 
                            className="mt-2 px-4 py-2 bg-green-500 text-white rounded-full font-semibold shadow-md"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {t('collect')} {getEmoji(animalData.product.id)}
                          </motion.button>
                      ) : (
                          <>
                              <div className="w-full mt-2 h-3 bg-gray-200 rounded-full border border-gray-300">
                                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${progress}%` }}></div>
                              </div>
                              <span className="text-xs text-gray-600 mt-1 block">
                                {timeLeft > 0 ? `${t('readyIn')} ${Math.ceil(timeLeft / 1000 / 60)}m` : t('producing')}
                              </span>
                          </>
                      )}
                  </motion.div>
                );
            })}
            {animals.length === 0 && <p className="col-span-full text-center text-gray-500 p-8">{t('noAnimals')}</p>}
        </div>
    </div>
  );

  const renderInventory = () => (
    <div className="p-4 bg-amber-200/50 rounded-2xl shadow-inner">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.values(inventory).map(item => {
                const itemDef = SHOP_ITEMS[item.itemId] || CROP_DEFINITIONS[item.itemId] || Object.values(ANIMAL_DEFINITIONS).find(a => a.product.id === item.itemId);
                const name = itemDef?.name || item.itemId;
                const sellPrice = CROP_DEFINITIONS[item.itemId]?.sellPrice || Object.values(ANIMAL_DEFINITIONS).find(a => a.product.id === item.itemId)?.product.sellPrice;
                
                return (
                    <li key={item.itemId} className="flex justify-between items-center p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-black/10">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{getEmoji(item.itemId)}</span>
                          <div>
                            <span className="font-semibold text-gray-800">{t(name)}</span>
                            <span className="text-gray-500 text-sm block">x {item.quantity}</span>
                          </div>
                        </div>
                        {sellPrice && (
                            <motion.button 
                              onClick={() => dispatch(sellItem({ itemId: item.itemId, quantity: 1 }))} 
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded-full font-semibold shadow"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {t('sell')} 1 {t('for')} {sellPrice}G
                            </motion.button>
                        )}
                    </li>
                );
            })}
             {Object.keys(inventory).length === 0 && <p className="col-span-full text-center text-gray-500 p-8">{t('emptyInventory')}</p>}
        </ul>
    </div>
  );
  
  const tabs = [
    { id: 'farm', label: t('farm') },
    { id: 'animals', label: t('animals') },
    { id: 'inventory', label: t('inventory') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-green-400 p-4 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-6 p-4 bg-white/50 backdrop-blur-md rounded-2xl shadow-lg border border-white/30">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tighter">{t('farmTitle')}</h1>
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-400 rounded-full shadow-md border-2 border-yellow-500">
            <span className="text-2xl">💰</span>
            <span className="text-xl font-bold text-yellow-900">{gold}</span>
          </div>
        </header>

        <div className="mb-6 flex justify-center p-1.5 bg-black/10 rounded-full">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`w-full py-2.5 text-lg font-bold rounded-full relative transition-colors ${
                selectedTab === tab.id ? 'text-gray-800' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              {selectedTab === tab.id && (
                <motion.div
                  layoutId="farmTabHighlight"
                  className="absolute inset-0 bg-white rounded-full shadow-md z-0"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {selectedTab === 'farm' && renderFarmPlots()}
            {selectedTab === 'animals' && renderAnimals()}
            {selectedTab === 'inventory' && renderInventory()}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {plantingPlotId && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
              onClick={() => setPlantingPlotId(null)}
            >
              <motion.div 
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                className="bg-amber-100 p-6 rounded-2xl shadow-xl w-full max-w-sm border-4 border-amber-700/50"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold mb-4 text-amber-900 text-center">{t('plantASeed')}</h3>
                <div className="flex flex-col space-y-3">
                  {availableSeeds.length > 0 ? (
                    availableSeeds.map(item => {
                      const shopItem = SHOP_ITEMS[item.itemId];
                      return (
                        <motion.button 
                          key={item.itemId} 
                          onClick={() => handlePlant(item.itemId)} 
                          className="w-full flex items-center gap-4 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold shadow-md"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="text-3xl">{getEmoji(item.itemId)}</span>
                          <span>{shopItem ? t(shopItem.name) : item.itemId}</span>
                          <span className="ml-auto text-green-200">x{item.quantity}</span>
                        </motion.button>
                      )
                    })
                  ) : (
                    <p className="text-center text-amber-800 py-4">{t('noSeeds')}</p>
                  )}
                </div>
                <motion.button 
                  onClick={() => setPlantingPlotId(null)} 
                  className="mt-6 w-full px-4 py-2 bg-gray-400/80 text-white rounded-xl font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('cancel')}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FarmPage;
