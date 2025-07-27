import React, { useState } from 'react';
import PerfumeCard from './PerfumeCard';
import type { Perfume } from '@shared/schema';

// Ejemplo de datos de perfumes
const samplePerfumes: Perfume[] = [
  {
    id: 1,
    name: "Invictus",
    brand: "Paco Rabanne",
    description: "Una fragancia masculina intensa y fresca con notas de pomelo y laurel.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["15.00", "25.00", "35.00"],
    category: "masculine",
    notes: ["Pomelo", "Laurel", "Ambergris", "Guayaco"],
    imageUrl: "https://i.imgur.com/dE1AVy1.png",
    rating: "4.5",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: true,
    discountPercentage: "20",
    offerDescription: "¡Oferta especial por tiempo limitado!",
    createdAt: new Date("2025-01-01T00:00:00Z"),
  },
  {
    id: 2,
    name: "Tobacco Vanille",
    brand: "Tom Ford",
    description: "Una mezcla rica y opulenta de tabaco y vainilla con un toque de especias.",
    sizes: ["5ml", "10ml"],
    prices: ["35.00", "65.00"],
    category: "unisex",
    notes: ["Tabaco", "Vainilla", "Cacao", "Tonka"],
    imageUrl: "https://i.imgur.com/4KOoPSE.png",
    rating: "4.8",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null,
    createdAt: new Date("2025-01-02T00:00:00Z"),
  },
  {
    id: 3,
    name: "Black Opium",
    brand: "Yves Saint Laurent",
    description: "Una fragancia adictiva y sensual con café negro y flor de azahar.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["20.00", "35.00", "50.00"],
    category: "feminine",
    notes: ["Café Negro", "Flor de Azahar", "Vainilla", "Cedro"],
    imageUrl: "https://i.imgur.com/example.png",
    rating: "4.6",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null,
    createdAt: new Date("2025-01-03T00:00:00Z"),
  }
];

// Ejemplo de uso del componente PerfumeCard
export default function PerfumeCardExample() {
  const [selectedSizes, setSelectedSizes] = useState<{ [key: number]: string }>({});

  const handleSizeChange = (perfumeId: number, size: string) => {
    setSelectedSizes(prev => ({
      ...prev,
      [perfumeId]: size
    }));
  };

  return (
    <div className="min-h-screen bg-black p-8">
      {/* Título */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Cards de Perfumes - LH Decants
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Componente completo de cards de perfumes con diseño de lujo, 
          animaciones suaves y funcionalidad completa de carrito.
        </p>
      </div>

      {/* Grid de cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {samplePerfumes.map((perfume, index) => (
          <PerfumeCard
            key={perfume.id}
            perfume={perfume}
            index={index}
            selectedSizes={selectedSizes}
            onSizeChange={handleSizeChange}
          />
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-16 text-center">
        <div className="bg-gray-900/50 rounded-xl p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">
            Características del Componente
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">Diseño</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Efecto cristal (glass morphism)</li>
                <li>• Animaciones suaves con Framer Motion</li>
                <li>• Hover effects y transiciones 3D</li>
                <li>• Diseño responsive y accesible</li>
                <li>• Tema de lujo con colores dorados</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">Funcionalidad</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Selector de tamaños interactivo</li>
                <li>• Cálculo de precios con ofertas</li>
                <li>• Integración con carrito de compras</li>
                <li>• Badges de marca y descuentos</li>
                <li>• Estados de loading y error</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Instrucciones de uso
/*
INSTRUCCIONES DE USO:

1. INSTALACIÓN DE DEPENDENCIAS:
   npm install framer-motion @tanstack/react-query

2. IMPORTS NECESARIOS:
   - PerfumeCard component
   - perfume-card-styles.css
   - Tipos de TypeScript desde @shared/schema

3. ESTRUCTURA DE ARCHIVOS:
   src/
   ├── components/
   │   ├── PerfumeCard.tsx
   │   └── ui/
   │       └── button.tsx
   ├── hooks/
   │   ├── use-toast.tsx
   │   └── use-cart.tsx
   ├── styles/
   │   └── perfume-card-styles.css
   └── types/
       └── perfume.ts (o @shared/schema)

4. CSS REQUERIDO:
   - Importar perfume-card-styles.css en tu archivo CSS principal
   - Asegurar que Tailwind CSS esté configurado
   - Incluir las fuentes Montserrat y Playfair Display

5. PROPS DEL COMPONENTE:
   interface PerfumeCardProps {
     perfume: Perfume;           // Objeto con datos del perfume
     index: number;              // Índice para animaciones escalonadas
     selectedSizes?: object;     // Estado de tamaños seleccionados (opcional)
     onSizeChange?: function;    // Callback para cambios de tamaño (opcional)
   }

6. EJEMPLO DE USO BÁSICO:
   <PerfumeCard 
     perfume={perfumeData} 
     index={0} 
   />

7. EJEMPLO CON ESTADO COMPARTIDO:
   <PerfumeCard 
     perfume={perfumeData} 
     index={0}
     selectedSizes={selectedSizes}
     onSizeChange={handleSizeChange}
   />
*/