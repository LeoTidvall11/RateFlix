import ScreenBackground from 'components/ScreenBackground';
import { useEffect } from 'react';
import { searchMovies } from 'services/externalApi';

export default function Search({ navigation }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setLoading(false);
      return;
    }
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await searchMovies(debouncedQuery);
        if (isMounted) {
          setResults(data.results || []);
        }
      } catch (err) {
        console.error('Sökfel:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  return <ScreenBackground></ScreenBackground>;
}
