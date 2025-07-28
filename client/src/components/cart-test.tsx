import React from 'react';
import { useCart } from '../hooks/use-cart';

export default function CartTest() {
  const { items, addToCart, totalItems, totalAmount } = useCart();

  const handleAddTestItem = () => {
    addToCart("0lHbtoskm6Y2fZ4bOHhh", "2ml", "15.99");
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Test del Carrito</h2>
      
      <div className="mb-4">
        <button 
          onClick={handleAddTestItem}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Agregar Item de Prueba
        </button>
      </div>

      <div className="mb-4">
        <p className="text-white">Total Items: {totalItems}</p>
        <p className="text-white">Total Amount: ${totalAmount.toFixed(2)}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Items en el carrito:</h3>
        {items.length === 0 ? (
          <p className="text-gray-400">No hay items en el carrito</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={index} className="text-white bg-gray-800 p-2 rounded">
                <p>ID: {item.id}</p>
                <p>Perfume ID: {item.perfumeId}</p>
                <p>Size: {item.size}</p>
                <p>Price: ${item.price}</p>
                <p>Quantity: {item.quantity}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-xs text-gray-400">
        <p>Debug Info:</p>
        <p>Items array length: {items.length}</p>
        <p>Items data: {JSON.stringify(items, null, 2)}</p>
      </div>
    </div>
  );
} 