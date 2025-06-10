import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { plantCrop, harvestPlot, sellItem, collectProduct } from '@/store/slices/farmSlice';
import { CROP_DEFINITIONS, ANIMAL_DEFINITIONS, SHOP_ITEMS } from '@/constants/farm';
import { FarmPlot, Animal } from '@/store/slices/farmSlice';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to get emoji
const getEmoji = (itemId: string) => {
  return CROP_DEFINITIONS[itemId]?.emoji ||
         ANIMAL_DEFINITIONS[itemId]?.emoji ||
         SHOP_ITEMS[itemId]?.emoji ||
         '❓';
};

const FarmPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { plots, animals, inventory } = useAppSelector((state) => state.farm);
  const gold = useAppSelector((state) => state.user.gold);
  const [selectedTab, setSelectedTab] = useState<'farm' | 'animals' | 'inventory'>('farm');
  const [plantingPlotId, setPlantingPlotId] = useState<string | null>(null);

  const handlePlotClick = (plot: FarmPlot) => {
    if (plot.cropId && plot.growthProgress >= 100) {
      dispatch(harvestPlot({ plotId: plot.id }));
    } else if (!plot.cropId) {
      setPlantingPlotId(plot.id);
    }
  };

  const handlePlant = (seedId: string) => {
    if (plantingPlotId) {
      const seedInInventory = inventory[seedId];
      if (seedInInventory && seedInInventory.quantity > 0) {
        dispatch(plantCrop({ plotId: plantingPlotId, seedId }));
      }
      setPlantingPlotId(null);
    }
  };

  const availableSeeds = Object.values(inventory).filter(item => SHOP_ITEMS[item.itemId]?.type === 'seed' && item.quantity > 0);

  const renderFarmPlots = () => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 p-4 bg-yellow-900/50 rounded-2xl shadow-inner">
      {plots.map((plot) => (
        <motion.div
          key={plot.id}
          onClick={() => handlePlotClick(plot)}
          className="relative aspect-square bg-stone-800 border-4 border-stone-900/50 rounded-2xl flex items-center justify-center cursor-pointer shadow-lg overflow-hidden"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          {/* Soil texture */}
          <div className="absolute inset-0 bg-[url('/soil-texture.png')] opacity-20"></div>

          <AnimatePresence>
            {plot.cropId && (
              <motion.div
                initial={{ scale: 0.2, y: 30, opacity: 0 }}
                animate={{
                  scale: 0.4 + (plot.growthProgress / 100) * 0.6,
                  y: 0,
                  opacity: 1
                }}
                exit={{ scale: 0, y: 30, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute z-10"
              >
                <div className="text-5xl md:text-6xl drop-shadow-lg">{getEmoji(plot.cropId)}</div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {plot.cropId && (
            <div className="absolute bottom-2 left-2 right-2 h-3 bg-black/30 rounded-full overflow-hidden border-2 border-stone-900/50">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-lime-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${plot.growthProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}

          <AnimatePresence>
            {plot.growthProgress >= 100 && (
              <motion.div
                initial={{ y: -10, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1, transition: { delay: 0.2 } }}
                exit={{ y: -10, opacity: 0, scale: 0.8 }}
                className="absolute top-1 right-1 px-2 py-0.5 text-xs font-bold text-white bg-green-600 rounded-full shadow-md z-20"
              >
                Ready
              </motion.div>
            )}
          </AnimatePresence>

          {!plot.cropId && (
            <div className="text-stone-500 text-4xl font-light">+</div>
          )}
        </motion.div>
      ))}
    </div>
  );

  const renderAnimals = () => (
    <div className="p-4 bg-green-200/50 rounded-2xl shadow-inner">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {animals.map((animal: Animal) => {
                const animalData = ANIMAL_DEFINITIONS[animal.type];
                if (!animalData) return null;
                const now = Date.now();
                const readyAt = animal.productReadyAt || (animal.lastFed || now) + (animalData.product.productionTime * 1000);
                const isReady = animal.productReadyAt && now >= animal.productReadyAt;
                const timeLeft = Math.max(readyAt - now, 0);
                const progress = isReady ? 100 : Math.min(100, 100 - (timeLeft / (animalData.product.productionTime * 1000)) * 100);

                return (
                  <motion.div 
                    key={animal.id} 
                    className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg flex flex-col items-center text-center border border-black/10"
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                      <div className="text-5xl mb-2 drop-shadow-lg">{getEmoji(animal.type)}</div>
                      <span className="font-bold text-gray-800">{animalData.name}</span>
                      
                      {isReady ? (
                          <motion.button 
                            onClick={() => dispatch(collectProduct({ animalId: animal.id }))} 
                            className="mt-2 px-4 py-2 bg-green-500 text-white rounded-full font-semibold shadow-md"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            Collect {getEmoji(animalData.product.id)}
                          </motion.button>
                      ) : (
                          <>
                              <div className="w-full mt-2 h-3 bg-gray-200 rounded-full border border-gray-300">
                                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${progress}%` }}></div>
                              </div>
                              <span className="text-xs text-gray-600 mt-1 block">
                                {timeLeft > 0 ? `Ready in ${Math.ceil(timeLeft / 1000 / 60)}m` : 'Producing...'}
                              </span>
                          </>
                      )}
                  </motion.div>
                );
            })}
            {animals.length === 0 && <p className="col-span-full text-center text-gray-500 p-8">You have no animals. Visit the shop to buy some!</p>}
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
                            <span className="font-semibold text-gray-800">{name}</span>
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
                              Sell 1 for {sellPrice}G
                            </motion.button>
                        )}
                    </li>
                );
            })}
             {Object.keys(inventory).length === 0 && <p className="col-span-full text-center text-gray-500 p-8">Your inventory is empty.</p>}
        </ul>
    </div>
  );
  
  const tabs = [
    { id: 'farm', label: 'Farm' },
    { id: 'animals', label: 'Animals' },
    { id: 'inventory', label: 'Inventory' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-green-400 p-4 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-6 p-4 bg-white/50 backdrop-blur-md rounded-2xl shadow-lg border border-white/30">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tighter">My Farm</h1>
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
            >
              <motion.div 
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                className="bg-amber-100 p-6 rounded-2xl shadow-xl w-full max-w-sm border-4 border-amber-700/50"
              >
                <h3 className="text-2xl font-bold mb-4 text-amber-900 text-center">Plant a Seed</h3>
                <div className="flex flex-col space-y-3">
                  {availableSeeds.length > 0 ? (
                    availableSeeds.map(item => (
                      <motion.button 
                        key={item.itemId} 
                        onClick={() => handlePlant(item.itemId)} 
                        className="w-full flex items-center gap-4 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold shadow-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="text-3xl">{getEmoji(item.itemId)}</span>
                        <span>{SHOP_ITEMS[item.itemId]?.name}</span>
                        <span className="ml-auto text-green-200">x{item.quantity}</span>
                      </motion.button>
                    ))
                  ) : (
                    <p className="text-center text-amber-800 py-4">No seeds available. Visit the shop!</p>
                  )}
                </div>
                <motion.button 
                  onClick={() => setPlantingPlotId(null)} 
                  className="mt-6 w-full px-4 py-2 bg-gray-400/80 text-white rounded-xl font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
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
