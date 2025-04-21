// Componente principal
const App = () => {
  const [roomTasks, setRoomTasks] = React.useState({
    pasillo: [
      "Aspiradora: alfombra",
      "Mueble de zapato",
      "Barrer piso/trapear",
      "Aspirar sillón",
      "Cito Fono (closet)",
      "Mueble azul"
    ],
    baño: [
      "Baño",
      "Toilet",
      "Espejo",
      "La tapa/la tina",
      "Toallas",
      "Barrer",
      "Mopa",
      "Sacar la basura",
      "Lavabo"
    ],
    living: [
      "Barrer",
      "Aspirar sillón",
      "Limpia mueble (anillo)",
      "Mesita blanca",
      "Estante",
      "Limpiar puerta de cocina"
    ],
    cocina: [
      "Limpiar piso: humedo toda la superficie (anti-grasa)",
      "Horno",
      "Microonda",
      "Refri",
      "Dentro gabinetes",
      "Limpiar parrilla",
      "Exterior: anti-grasa",
      "Alrededores de los muebles",
      "Cocina"
    ]
  });

  const [residents, setResidents] = React.useState([
    { id: 1, name: "Residente 1", cantCleanBathroom: false },
    { id: 2, name: "Residente 2", cantCleanBathroom: false },
    { id: 3, name: "Residente 3", cantCleanBathroom: false },
    { id: 4, name: "Residente 4", cantCleanBathroom: true }
  ]);

  const [currentWeek, setCurrentWeek] = React.useState(1);
  const [assignments, setAssignments] = React.useState({});
  const [editingResident, setEditingResident] = React.useState(null);
  const [tempName, setTempName] = React.useState("");
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [currentRoom, setCurrentRoom] = React.useState(null);
  const [selectionAnimation, setSelectionAnimation] = React.useState([]); // Para la animación
  const [animationIndex, setAnimationIndex] = React.useState(0);
  const animationRef = React.useRef(null);

  const roomNames = {
    pasillo: "Pasillo",
    baño: "Baño",
    living: "Living",
    cocina: "Cocina"
  };

  // Definición de habitaciones para la ruleta - colores más vibrantes
  const roomColors = {
    pasillo: "#f59e0b", // Amarillo/naranja
    baño: "#3b82f6",    // Azul
    living: "#10b981",  // Verde
    cocina: "#ef4444"   // Rojo
  };

  // Generar asignaciones de habitaciones por semana
  const generateRotation = () => {
    const availableRooms = Object.keys(roomTasks);
    const newAssignments = {};
    
    // Crear una copia de los residentes para poder modificarla
    const availableResidents = [...residents];
    
    // Primero asignar el baño a alguien que pueda limpiarlo
    const bathroomIndex = availableRooms.indexOf('baño');
    if (bathroomIndex !== -1) {
      // Filtrar residentes que pueden limpiar el baño
      const canCleanBathroom = availableResidents.filter(r => !r.cantCleanBathroom);
      
      // Determinar quién limpia el baño esta semana (rotación basada en la semana)
      const bathroomCleanerIndex = (currentWeek - 1) % canCleanBathroom.length;
      const bathroomCleaner = canCleanBathroom[bathroomCleanerIndex];
      
      newAssignments['baño'] = bathroomCleaner.id;
      
      // Remover el baño de las habitaciones disponibles
      availableRooms.splice(bathroomIndex, 1);
      
      // Remover al limpiador del baño de los residentes disponibles temporalmente
      const residentIndex = availableResidents.findIndex(r => r.id === bathroomCleaner.id);
      if (residentIndex !== -1) {
        availableResidents.splice(residentIndex, 1);
      }
    }
    
    // Ahora asignar el resto de habitaciones
    let startingIndex = (currentWeek - 1) % availableResidents.length;
    
    for (let i = 0; i < availableRooms.length; i++) {
      const roomKey = availableRooms[i];
      const residentIndex = (startingIndex + i) % availableResidents.length;
      newAssignments[roomKey] = availableResidents[residentIndex].id;
    }
    
    setAssignments(newAssignments);
  };

  // Ejecutar la generación de rotaciones cuando cambia la semana o los residentes
  React.useEffect(() => {
    generateRotation();
  }, [currentWeek, residents]);

  const nextWeek = () => {
    setCurrentWeek(currentWeek + 1);
  };

  const prevWeek = () => {
    if (currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
    }
  };

  const getResidentNameById = (id) => {
    const resident = residents.find(r => r.id === id);
    return resident ? resident.name : "No asignado";
  };

  const startEditing = (resident) => {
    setEditingResident(resident.id);
    setTempName(resident.name);
  };

  const saveResidentName = () => {
    if (tempName.trim() !== "") {
      setResidents(residents.map(r => 
        r.id === editingResident ? {...r, name: tempName.trim()} : r
      ));
      setEditingResident(null);
    }
  };

  const toggleBathroomRestriction = (residentId) => {
    // Asegúrate de que al menos un residente pueda limpiar el baño
    const otherCanClean = residents.some(r => r.id !== residentId && !r.cantCleanBathroom);
    
    if (otherCanClean || residents.find(r => r.id === residentId).cantCleanBathroom) {
      setResidents(residents.map(r => 
        r.id === residentId ? {...r, cantCleanBathroom: !r.cantCleanBathroom} : r
      ));
    } else {
      alert("Al menos un residente debe poder limpiar el baño");
    }
  };

  // Función para seleccionar una habitación aleatoria con animación
  const selectRandomRoom = () => {
    if (isSelecting) return;
    
    setIsSelecting(true);
    setCurrentRoom(null);
    
    // Lista de habitaciones
    const rooms = ['pasillo', 'baño', 'living', 'cocina'];
    
    // Crear una animación aleatoria (15-20 pasos)
    const animSteps = 15 + Math.floor(Math.random() * 6);
    const animation = [];
    
    // Generar secuencia de animación con habitaciones aleatorias
    for (let i = 0; i < animSteps; i++) {
      const randomIndex = Math.floor(Math.random() * rooms.length);
      animation.push(rooms[randomIndex]);
    }
    
    // La última habitación es la seleccionada aleatoriamente
    const finalRoom = rooms[Math.floor(Math.random() * rooms.length)];
    animation.push(finalRoom);
    
    setSelectionAnimation(animation);
    setAnimationIndex(0);
    
    // Iniciar la animación
    animationRef.current = setInterval(() => {
      setAnimationIndex(prev => {
        if (prev >= animation.length - 1) {
          clearInterval(animationRef.current);
          setIsSelecting(false);
          setCurrentRoom(animation[animation.length - 1]);
          return prev;
        }
        return prev + 1;
      });
    }, 150); // Velocidad de la animación (va disminuyendo)
  };

  // Limpiar intervalo al desmontar
  React.useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4">
      {/* Encabezado */}
      <header className="bg-blue-600 text-white p-4 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold text-center">Planificador de Limpieza del Hogar</h1>
        <div className="flex justify-center items-center mt-2">
          <button onClick={prevWeek} className="bg-blue-700 p-2 rounded-l-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-180"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          </button>
          <div className="bg-blue-800 px-4 py-2">
            <span className="font-medium">Semana {currentWeek}</span>
          </div>
          <button onClick={nextWeek} className="bg-blue-700 p-2 rounded-r-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          </button>
        </div>
      </header>
      
      {/* Generador aleatorio */}
      <div className="flex flex-col items-center justify-center mb-6">
        {/* Cuadrado con animación */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-2 w-64 h-64 p-2 rounded-lg bg-white shadow-lg">
            {Object.keys(roomColors).map((room) => (
              <div 
                key={room} 
                className={`flex items-center justify-center rounded-lg transition-all duration-200 ${
                  selectionAnimation[animationIndex] === room ? 'scale-110 shadow-md' : 'scale-100'
                }`} 
                style={{ 
                  backgroundColor: roomColors[room],
                  transform: selectionAnimation[animationIndex] === room ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                <span className="text-white font-bold text-xl">{roomNames[room]}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Botón para seleccionar */}
        <button 
          onClick={selectRandomRoom}
          disabled={isSelecting}
          className={`flex items-center px-8 py-4 rounded-full text-white font-bold text-lg shadow-lg mb-6 ${
            isSelecting ? 'bg-gray-500' : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m7 16 4 4 8-8"></path><path d="m7 8 4 4"></path><circle cx="19" cy="4" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="15" cy="12" r="1"></circle><path d="m4 7 4.5 4.5"></path><path d="m15 19 5-5"></path><path d="m5 19 4-4"></path><path d="m19 5-4 4"></path></svg>
          {isSelecting ? 'Seleccionando...' : 'Seleccionar al azar'}
        </button>
        
        {/* Resultado de la selección */}
        {currentRoom && (
          <div className="bg-white p-6 rounded-lg shadow-md text-center w-80 border-t-4 border-b-4 transform transition-all duration-300" 
               style={{ 
                 borderTopColor: roomColors[currentRoom],
                 borderBottomColor: roomColors[currentRoom],
                 boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
               }}>
            <p className="text-xl font-bold mb-1">¡Habitación seleccionada!</p>
            <p className="text-3xl font-bold my-3" style={{ color: roomColors[currentRoom] }}>
              {roomNames[currentRoom]}
            </p>
            <p className="mt-2 text-gray-700">
              Asignado a: <span className="font-bold">{getResidentNameById(assignments[currentRoom])}</span>
            </p>
          </div>
        )}
      </div>

      {/* Listado de habitaciones y tareas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {Object.keys(roomTasks).map(roomKey => (
          <div key={roomKey} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 text-white font-bold text-lg" style={{ backgroundColor: roomColors[roomKey] }}>
              <div className="flex justify-between items-center">
                <h2>{roomNames[roomKey]}</h2>
                <div className="bg-white text-gray-800 rounded-full px-3 py-1 text-sm">
                  {getResidentNameById(assignments[roomKey])}
                </div>
              </div>
            </div>
            <ul className="divide-y divide-gray-100">
              {roomTasks[roomKey].map((task, index) => (
                <li key={index} className="p-3 hover:bg-gray-50 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mr-2"><circle cx="12" cy="12" r="10"></circle></svg>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Sección de residentes */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-700">Residentes</h2>
        <ul className="divide-y divide-gray-100">
          {residents.map(resident => (
            <li key={resident.id} className="py-3 flex items-center justify-between">
              {editingResident === resident.id ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="border rounded px-2 py-1 mr-2"
                    autoFocus
                  />
                  <button 
                    onClick={saveResidentName}
                    className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Guardar
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="font-medium mr-2">{resident.name}</span>
                  <button 
                    onClick={() => startEditing(resident)}
                    className="text-blue-500 text-sm"
                  >
                    Editar
                  </button>
                </div>
              )}
              <div className="flex items-center">
                <span className="mr-2 text-sm">No limpia baño:</span>
                <button 
                  onClick={() => toggleBathroomRestriction(resident.id)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    resident.cantCleanBathroom ? 'bg-red-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  {resident.cantCleanBathroom && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Sección de instrucciones */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold mb-2 text-gray-700">Instrucciones</h2>
        <p className="text-gray-600 mb-2">
          Esta aplicación te ayuda a gestionar la rotación de tareas de limpieza semanalmente.
        </p>
        <ul className="list-disc pl-5 text-gray-600">
          <li>¡Haz clic en "Seleccionar al azar" para elegir una habitación!</li>
          <li>Usa los botones de navegación para cambiar la semana y ver la rotación.</li>
          <li>Puedes editar los nombres de los residentes haciendo clic en "Editar".</li>
          <li>Marca quién no puede limpiar el baño con el botón correspondiente.</li>
          <li>La rotación se genera automáticamente respetando las restricciones.</li>
        </ul>
      </div>
    </div>
  );
};

// Renderizar la aplicación
ReactDOM.render(<App />, document.getElementById('root'));