import { useState, useEffect } from 'react';

function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '', peso: '', versiones: '', jugadores: '', valor: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authForm, setAuthForm] = useState({ 
    nombre: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setView('games');
      fetchGames(savedToken);
    }
  }, []);

  const fetchGames = async (authToken) => {
    try {
      const res = await fetch('http://localhost:5000/api/games', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) setGames(data.data);
    } catch (err) {
      console.error('Error fetching games:', err);
    }
  };

  const handleAuthSubmit = async (isLogin) => {
    setAuthLoading(true);
    setAuthError('');

    if (!isLogin && authForm.password !== authForm.confirmPassword) {
      setAuthError('Las contraseñas no coinciden');
      setAuthLoading(false);
      return;
    }

    if (authForm.password.length < 6) {
      setAuthError('La contraseña debe tener al menos 6 caracteres');
      setAuthLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email: authForm.email, password: authForm.password }
        : { nombre: authForm.nombre, email: authForm.email, password: authForm.password };

      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setToken(data.data.token);
      setUser(data.data.user);
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      setView('games');
      fetchGames(data.data.token);
      setAuthForm({ nombre: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setGames([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setView('login');
  };

  const handleSubmitGame = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const url = editingGame 
        ? `http://localhost:5000/api/games/${editingGame._id || editingGame.id}`
        : 'http://localhost:5000/api/games';
      
      const res = await fetch(url, {
        method: editingGame ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(editingGame ? 'Juego actualizado' : 'Juego creado');
      setFormData({ nombre: '', peso: '', versiones: '', jugadores: '', valor: '' });
      setEditingGame(null);
      setShowForm(false);
      fetchGames(token);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (game) => {
    setEditingGame(game);
    setFormData({
      nombre: game.nombre,
      peso: game.peso,
      versiones: game.versiones,
      jugadores: game.jugadores,
      valor: game.valor
    });
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este juego?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/games/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess('Juego eliminado');
      fetchGames(token);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingGame(null);
    setFormData({ nombre: '', peso: '', versiones: '', jugadores: '', valor: '' });
    setError('');
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-75"></div>
          
          <div className="relative bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4">
                <span className="text-4xl">🎮</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Bienvenido</h2>
              <p className="text-gray-400">Inicia sesión para gestionar tus juegos PS5/PS4</p>
            </div>

            {authError && (
              <div className="mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg">
                <span className="text-red-200 text-sm">{authError}</span>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={authForm.password}
                    onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleAuthSubmit(true)}
                disabled={authLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setView('register')}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                ¿No tienes cuenta? Regístrate
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl blur opacity-75"></div>
          
          <div className="relative bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl mb-4">
                <span className="text-4xl">👤</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Crear Cuenta</h2>
              <p className="text-gray-400">Únete y gestiona tu colección</p>
            </div>

            {authError && (
              <div className="mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg">
                <span className="text-red-200 text-sm">{authError}</span>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
                <input
                  type="text"
                  value={authForm.nombre}
                  onChange={(e) => setAuthForm({...authForm, nombre: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar Contraseña</label>
                <input
                  type="password"
                  value={authForm.confirmPassword}
                  onChange={(e) => setAuthForm({...authForm, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20"
                  placeholder="••••••••"
                />
              </div>

              <button
                onClick={() => handleAuthSubmit(false)}
                disabled={authLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? 'Creando...' : 'Crear Cuenta'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setView('login')}
                className="text-purple-400 hover:text-purple-300 text-sm"
              >
                ¿Ya tienes cuenta? Inicia sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <nav className="bg-gray-900 bg-opacity-95 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🎮</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">PS5 Games Manager</h1>
              <p className="text-sm text-gray-400">Hola, {user?.nombre}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {success && (
          <div className="mb-6 p-4 bg-green-500 bg-opacity-10 border border-green-500 rounded-lg text-green-200">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all"
          >
            + Agregar Juego
          </button>
        )}

        {showForm && (
          <div className="mb-8 bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">
              {editingGame ? 'Editar Juego' : 'Nuevo Juego'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
                <input
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="God of War Ragnarök"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Peso (GB)</label>
                <input
                  type="number"
                  value={formData.peso}
                  onChange={(e) => setFormData({...formData, peso: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="85"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Versiones</label>
                <input
                  value={formData.versiones}
                  onChange={(e) => setFormData({...formData, versiones: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="PS5/PS4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Jugadores</label>
                <input
                  value={formData.jugadores}
                  onChange={(e) => setFormData({...formData, jugadores: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="1-4"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Valor ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({...formData, valor: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="69.99"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmitGame}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : editingGame ? 'Actualizar' : 'Crear'}
              </button>
              <button
                onClick={cancelForm}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div key={game._id || game.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all">
              <h3 className="text-xl font-bold text-white mb-4">{game.nombre}</h3>
              <div className="space-y-2 text-gray-300 text-sm mb-4">
                <p><span className="text-gray-500">Peso:</span> {game.peso} GB</p>
                <p><span className="text-gray-500">Versiones:</span> {game.versiones}</p>
                <p><span className="text-gray-500">Jugadores:</span> {game.jugadores}</p>
                <p><span className="text-gray-500">Valor:</span> ${game.valor}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(game)}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(game._id || game.id)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {games.length === 0 && !showForm && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold text-white mb-2">No hay juegos aún</h3>
            <p className="text-gray-400">Agrega tu primer juego de PS5</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;