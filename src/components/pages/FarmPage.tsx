import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { plantCrop, harvestPlot, sellItem, collectProduct } from '@/store/slices/farmSlice';
import { CROP_DEFINITIONS, ANIMAL_DEFINITIONS, SHOP_ITEMS } from '@/constants/farm';
import { FarmPlot, Animal } from '@/store/slices/farmSlice';

const FarmPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { gold, plots, animals, inventory } = useAppSelector((state) => state.farm);
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
      dispatch(plantCrop({ plotId: plantingPlotId, seedId }));
      setPlantingPlotId(null);
    }
  };

  const availableSeeds = Object.values(inventory).filter(item => SHOP_ITEMS[item.itemId]?.type === 'seed');

  const getCropEmoji = (cropId: string) => (CROP_DEFINITIONS[cropId]?.emoji || '🌱');
  const getAnimalEmoji = (animalType: string) => (ANIMAL_DEFINITIONS[animalType]?.emoji || '🐾');

  const renderFarmPlots = () => (
    <div className="grid grid-cols-3 gap-4 p-4 bg-green-200 rounded-lg">
      {plots.map((plot) => (
        <div key={plot.id} onClick={() => handlePlotClick(plot)} className="relative w-24 h-24 bg-yellow-700 border-4 border-yellow-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-yellow-600 transition-colors">
          {plot.cropId && (
            <>
              <div className="text-4xl">{getCropEmoji(plot.cropId)}</div>
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-300 rounded-b-lg overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${plot.growthProgress}%` }}></div>
              </div>
              {plot.growthProgress >= 100 && <div className="absolute top-0 right-0 px-2 py-1 text-xs text-white bg-blue-500 rounded-bl-lg">Harvest!</div>}
            </>
          )}
          {!plot.cropId && <div className="text-gray-400 text-sm">Empty</div>}
        </div>
      ))}
    </div>
  );

  const renderAnimals = () => (
    <div className="p-4 bg-blue-100 rounded-lg">
        <h2 className="text-xl font-bold mb-4">My Animals</h2>
        <div className="grid grid-cols-4 gap-4">
            {animals.map((animal: Animal) => (
                <div key={animal.id} className="p-4 bg-white rounded-lg shadow-md flex flex-col items-center">
                    <div className="text-4xl mb-2">{getAnimalEmoji(animal.type)}</div>
                    <span className="font-semibold">{ANIMAL_DEFINITIONS[animal.type]?.name}</span>
                    {(() => {
                        const animalData = ANIMAL_DEFINITIONS[animal.type];
                        if (!animalData) return null;
                        const now = Date.now();
                        const lastFed = animal.lastFed || now;
                        const productionTime = animalData.product.productionTime * 1000; // ms
                        const readyAt = animal.productReadyAt || (lastFed + productionTime);
                        const timeLeft = Math.max(readyAt - now, 0);
                        const progress = Math.min(100, 100 - (timeLeft / productionTime) * 100);
                        if (animal.productReadyAt && now >= animal.productReadyAt) {
                            return <button onClick={() => dispatch(collectProduct({ animalId: animal.id }))} className="mt-2 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600">Collect</button>;
                        } else {
                            return (
                                <>
                                    <div className="w-full mt-2 h-2 bg-gray-200 rounded">
                                        <div className="h-full bg-blue-400 rounded" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-1 block">{timeLeft > 0 ? `Ready in ${Math.ceil(timeLeft / 1000 / 60)} min` : 'Producing...'}</span>
                                </>
                            );
                        }
                    })()}

                </div>
            ))}
            {animals.length === 0 && <p>You have no animals. Visit the shop to buy some!</p>}
        </div>
    </div>
  );

  const renderInventory = () => (
    <div className="p-4 bg-yellow-100 rounded-lg">
        <h2 className="text-xl font-bold mb-4">My Inventory</h2>
        <ul className="space-y-2">
            {Object.values(inventory).map(item => {
                const cropDef = CROP_DEFINITIONS[item.itemId];
                const animalProdDef = Object.values(ANIMAL_DEFINITIONS).find(a => a.product.id === item.itemId)?.product;
                const seedDef = SHOP_ITEMS[item.itemId];

                const name = cropDef?.name || animalProdDef?.name || seedDef?.name || item.itemId;
                const sellPrice = cropDef?.sellPrice || animalProdDef?.sellPrice;

                return (
                    <li key={item.itemId} className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
                        <span>{name} x {item.quantity}</span>
                        {sellPrice && (
                            <button onClick={() => dispatch(sellItem({ itemId: item.itemId, quantity: 1 }))} className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600">Sell 1 for {sellPrice}G</button>
                        )}
                    </li>
                );
            })}
             {Object.keys(inventory).length === 0 && <p>Your inventory is empty.</p>}
        </ul>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4 p-4 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800">My Farm</h1>
        <div className="text-2xl font-bold text-yellow-500">{gold}G</div>
      </div>

      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setSelectedTab('farm')} className={`${selectedTab === 'farm' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Farm Plots</button>
          <button onClick={() => setSelectedTab('animals')} className={`${selectedTab === 'animals' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Animals</button>
          <button onClick={() => setSelectedTab('inventory')} className={`${selectedTab === 'inventory' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Inventory</button>
        </nav>
      </div>

      <div>
        {selectedTab === 'farm' && renderFarmPlots()}
        {selectedTab === 'animals' && renderAnimals()}
        {selectedTab === 'inventory' && renderInventory()}
      </div>

      {plantingPlotId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold mb-4">Plant a Seed</h3>
            <div className="flex flex-col space-y-2">
              {availableSeeds.length > 0 ? (
                availableSeeds.map(item => (
                  <button key={item.itemId} onClick={() => handlePlant(item.itemId)} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                    {SHOP_ITEMS[item.itemId]?.name} ({item.quantity})
                  </button>
                ))
              ) : (
                <p>No seeds available. Visit the shop!</p>
              )}
            </div>
            <button onClick={() => setPlantingPlotId(null)} className="mt-4 px-4 py-2 bg-gray-300 rounded-md">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmPage;
