import { useEffect, useState } from 'react';
import axios from 'axios';

export const SellosNutricionales = ({ nombreProducto }) => {
  const [sellos, setSellos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const calcularSellosLocales = (nombre) => {
      const nombreLower = nombre.toLowerCase();
      const sellosPersonalizados = [];

      if (nombreLower.includes('sin azúcar') || nombreLower.includes('sin azucar')) {
        sellosPersonalizados.push('ALTO EN CALORÍAS');
      } else if (nombreLower.includes('manjar') || nombreLower.includes('caramelo') || nombreLower.includes('dulce')) {
        sellosPersonalizados.push('ALTO EN AZÚCARES', 'ALTO EN CALORÍAS');
      } else if (nombreLower.includes('chocolate') || nombreLower.includes('trufa') || nombreLower.includes('crema')) {
        sellosPersonalizados.push('ALTO EN AZÚCARES', 'ALTO EN GRASAS SATURADAS', 'ALTO EN CALORÍAS');
      } else if (nombreLower.includes('fruta') || nombreLower.includes('piña') || nombreLower.includes('durazno')) {
        sellosPersonalizados.push('ALTO EN AZÚCARES');
      } else if (nombreLower.includes('hojarasca') || nombreLower.includes('galleta')) {
        sellosPersonalizados.push('ALTO EN CALORÍAS', 'ALTO EN GRASAS SATURADAS');
      } else {
        sellosPersonalizados.push('ALTO EN AZÚCARES', 'ALTO EN CALORÍAS');
      }

      return sellosPersonalizados;
    };

    const obtenerInformacionNutricional = async () => {
      const cacheKey = `sellos_${nombreProducto.toLowerCase().trim()}`;
      const enCache = sessionStorage.getItem(cacheKey);

      if (enCache) {
        setSellos(JSON.parse(enCache));
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        const response = await axios.get(
          `/api-nutricion/cgi/search.pl?search_terms=${encodeURIComponent(nombreProducto)}&search_simple=1&action=process&json=1`,
          { timeout: 4000 }
        );

        if (response.data?.products && response.data.products.length > 0) {
          const producto = response.data.products[0];
          const nutriments = producto.nutriments || {};
          const nuevosSellos = [];

          if ((nutriments.sugars_100g || 0) > 10) nuevosSellos.push('ALTO EN AZÚCARES');
          if ((nutriments['saturated-fat_100g'] || 0) > 4) nuevosSellos.push('ALTO EN GRASAS SATURADAS');
          if ((nutriments.energy_100g || 0) > 275) nuevosSellos.push('ALTO EN CALORÍAS');
          if ((nutriments.sodium_100g || 0) > 0.4) nuevosSellos.push('ALTO EN SODIO');

          if (nuevosSellos.length > 0) {
            sessionStorage.setItem(cacheKey, JSON.stringify(nuevosSellos));
            setSellos(nuevosSellos);
            setCargando(false);
            return;
          }
        }
      } catch {
        // Silencia error de red/timeout y aplica cálculo local sin ensuciar la consola
      }

      const sellosFallback = calcularSellosLocales(nombreProducto);
      sessionStorage.setItem(cacheKey, JSON.stringify(sellosFallback));
      setSellos(sellosFallback);
      setCargando(false);
    };

    if (nombreProducto) {
      obtenerInformacionNutricional();
    }
  }, [nombreProducto]);

  if (cargando) {
    return <small className="text-muted">Cargando sellos...</small>;
  }

  return (
    <div className="d-flex flex-wrap justify-content-center gap-1 my-2">
      {sellos.map((sello, index) => (
        <span
          key={index}
          className="badge bg-dark text-white border border-secondary p-1"
          style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}
        >
          {sello}
        </span>
      ))}
    </div>
  );
};