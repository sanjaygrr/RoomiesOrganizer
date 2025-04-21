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
  const [editingResident, setEditingResident] = React.useState(null);
  const [tempName, setTempName] = React.useState("");
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [selectionAnimation, setSelectionAnimation] = React.useState([]); // Para la animación
  const [animationIndex, setAnimationIndex] = React.useState(0);
  const animationRef = React.useRef(null);
  
  // Para almacenar las asignaciones automáticas
  const [assignments, setAssignments] = React.useState({});
  // Para almacenar la última habitación seleccionada
  const [lastSelectedRoom, setLastSelectedRoom] = React.useState(null);
  
  // Historial de habitaciones seleccionadas por cada residente
  const [assignmentHistory, setAssignmentHistory] = React.useState([]);

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

  const nextWeek = () => {
    setCurrentWeek(currentWeek + 1);
    resetAllAssignments();
  };

  const prevWeek = () => {
    if (currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
      resetAllAssignments();
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
  
  // Obtener la lista de residentes disponibles para asignar
  const getAvailableResidents = (room) => {
    return residents.filter(resident => {
      // Si es el baño, verificar restricción
      if (room === 'baño' && resident.cantCleanBathroom) {
        return false;
      }
      
      // Verificar si ya tiene asignada una habitación
      return !Object.values(assignments).includes(resident.id);
    });
  };
  
  // Elegir automáticamente un residente para la habitación seleccionada
  const selectResidentForRoom = (room) => {
    const availableResidents = getAvailableResidents(room);
    
    if (availableResidents.length === 0) {
      return null; // No hay residentes disponibles
    }
    
    // Seleccionar un residente al azar
    const randomIndex = Math.floor(Math.random() * availableResidents.length);
    return availableResidents[randomIndex].id;
  };

  // Función para seleccionar una habitación aleatoria con animación
  // y asignarla automáticamente a un residente disponible
  const selectRandomRoom = () => {
    if (isSelecting) return;
    
    setIsSelecting(true);
    
    // Lista de habitaciones que faltan por asignar
    const unassignedRooms = Object.keys(roomTasks).filter(room => !assignments[room]);
    
    if (unassignedRooms.length === 0) {
      // Todas las habitaciones están asignadas
      alert("Todas las habitaciones ya han sido asignadas. Reinicia o cambia de semana para comenzar de nuevo.");
      setIsSelecting(false);
      return;
    }
    
    // Crear una animación aleatoria (15-20 pasos)
    const animSteps = 15 + Math.floor(Math.random() * 6);
    const animation = [];
    
    // Generar secuencia de animación con habitaciones aleatorias
    for (let i = 0; i < animSteps; i++) {
      const randomIndex = Math.floor(Math.random() * unassignedRooms.length);
      animation.push(unassignedRooms[randomIndex]);
    }
    
    // La última habitación es una de las no asignadas, elegida al azar
    const finalRoomIndex = Math.floor(Math.random() * unassignedRooms.length);
    const finalRoom = unassignedRooms[finalRoomIndex];
    animation.push(finalRoom);
    
    setSelectionAnimation(animation);
    setAnimationIndex(0);
    
    // Iniciar la animación
    animationRef.current = setInterval(() => {
      setAnimationIndex(prev => {
        if (prev >= animation.length - 1) {
          clearInterval(animationRef.current);
          
          // Al finalizar la animación, asignar la habitación a un residente disponible
          const selectedRoom = animation[animation.length - 1];
          const selectedResidentId = selectResidentForRoom(selectedRoom);
          
          if (selectedResidentId) {
            // Guardar la asignación
            setAssignments(prev => ({
              ...prev,
              [selectedRoom]: selectedResidentId
            }));
            
            // Guardar en el historial
            setAssignmentHistory(prev => [
              ...prev,
              {
                week: currentWeek,
                room: selectedRoom,
                residentId: selectedResidentId,
                timestamp: new Date().toISOString()
              }
            ]);
            
            // Guardar la última habitación seleccionada
            setLastSelectedRoom(selectedRoom);
          } else {
            // No hay residentes disponibles para esta habitación
            alert(`No hay residentes disponibles para asignar a ${roomNames[selectedRoom]}`);
          }
          
          setIsSelecting(false);
          return prev;
        }
        return prev + 1;
      });
    }, 150); // Velocidad de la animación
  };
  
  // Resetear todas las asignaciones
  const resetAllAssignments = () => {
    setAssignments({});
    setLastSelectedRoom(null);
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
      
      {/* Resumen de asignaciones actuales */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4 text-center text-gray-700">Asignaciones de la Semana {currentWeek}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {residents.map(resident => {
            // Buscar si este residente tiene una habitación asignada
            const assignedRoom = Object.entries(assignments).find(
              ([room, id]) => id === resident.id
            );
            
            return (
              <div 
                key={resident.id} 
                className="bg-white rounded-lg border-2 shadow p-3 flex flex-col items-center"
                style={{ 
                  borderColor: assignedRoom ? roomColors[assignedRoom[0]] : 'gray',
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="font-bold text-lg mb-1">{resident.name}</div>
                {assignedRoom ? (
                  <div 
                    className="text-white font-bold rounded-full px-4 py-1 mb-1"
                    style={{ backgroundColor: roomColors[assignedRoom[0]] }}
                  >
                    {roomNames[assignedRoom[0]]}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">Esperando asignación</div>
                )}
                {resident.cantCleanBathroom && (
                  <div className="text-xs text-red-500 mt-1">No puede limpiar baño</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Generador aleatorio */}
      <div className="flex flex-col items-center justify-center mb-6">
        {/* Cuadrado con animación */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 w-72 h-72 p-3 rounded-lg bg-white shadow-lg">
            {Object.keys(roomColors).map((room) => (
              <div 
                key={room} 
                className={`flex items-center justify-center rounded-lg transition-all duration-200 shadow ${
                  selectionAnimation[animationIndex] === room ? 'scale-110 shadow-lg ring-2 ring-white' : 
                  lastSelectedRoom === room ? 'scale-105 ring-2 ring-white' : 'scale-100'
                } ${
                  assignments[room] ? 'opacity-50' : 'opacity-100'
                }`} 
                style={{ 
                  backgroundColor: roomColors[room],
                  transform: selectionAnimation[animationIndex] === room ? 'scale(1.1)' : 
                             lastSelectedRoom === room ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-white font-bold text-xl">{roomNames[room]}</span>
                  {assignments[room] && (
                    <span className="text-white text-sm bg-black bg-opacity-30 px-2 py-0.5 rounded mt-1">
                      {getResidentNameById(assignments[room])}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Botón para seleccionar */}
        <button 
          onClick={selectRandomRoom}
          disabled={isSelecting}
          className={`flex items-center px-8 py-4 rounded-full text-white font-bold text-lg shadow-lg mb-4 ${
            isSelecting ? 'bg-gray-500' : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mr-2 ${isSelecting ? 'animate-spin' : ''}`}><path d="m7 16 4 4 8-8"></path><path d="m7 8 4 4"></path><circle cx="19" cy="4" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="15" cy="12" r="1"></circle><path d="m4 7 4.5 4.5"></path><path d="m15 19 5-5"></path><path d="m5 19 4-4"></path><path d="m19 5-4 4"></path></svg>
          {isSelecting ? 'Seleccionando...' : 'Girar y Asignar'}
        </button>
        
        {/* Última selección */}
        {lastSelectedRoom && (
          <div className="bg-white p-4 rounded-lg shadow-md text-center w-80 border-t-4 border-b-4 transform transition-all duration-300 mb-4" 
               style={{ 
                 borderTopColor: roomColors[lastSelectedRoom],
                 borderBottomColor: roomColors[lastSelectedRoom],
                 boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
               }}>
            <p className="text-xl font-bold mb-1">Última asignación:</p>
            <p className="text-3xl font-bold my-3" style={{ color: roomColors[lastSelectedRoom] }}>
              {roomNames[lastSelectedRoom]}
            </p>
            <p className="mt-2 text-gray-700">
              Asignado a: <span className="font-bold">{getResidentNameById(assignments[lastSelectedRoom])}</span>
            </p>
          </div>
        )}
        
        {/* Botón para reiniciar */}
        {Object.keys(assignments).length > 0 && (
          <button
            onClick={resetAllAssignments}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium shadow-md"
          >
            Reiniciar Asignaciones
          </button>
        )}
      </div>

      {/* Listado de habitaciones y tareas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {Object.keys(roomTasks).map(roomKey => (
          <div key={roomKey} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 text-white font-bold text-lg" style={{ backgroundColor: roomColors[roomKey] }}>
              <div className="flex justify-between items-center">
                <h2>{roomNames[roomKey]}</h2>
                {assignments[roomKey] ? (
                  <div className="bg-white text-gray-800 rounded-full px-3 py-1 text-sm">
                    {getResidentNameById(assignments[roomKey])}
                  </div>
                ) : (
                  <div className="bg-white text-gray-500 rounded-full px-3 py-1 text-sm italic">
                    Sin asignar
                  </div>
                )}
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

      {/* Sección de gestión de residentes */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-700">Configuración de Residentes</h2>
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
          Esta aplicación te ayuda a gestionar la rotación de tareas de limpieza.
        </p>
        <ul className="list-disc pl-5 text-gray-600">
          <li>Haz clic en "Girar y Asignar" para seleccionar una habitación y asignarla automáticamente a un residente disponible.</li>
          <li>Cada residente será asignado a una sola habitación por semana.</li>
          <li>Los residentes con restricciones no serán asignados al baño.</li>
          <li>Usa "Reiniciar Asignaciones" para comenzar de nuevo.</li>
          <li>Cuando cambies de semana, se reiniciarán todas las asignaciones.</li>
        </ul>
      </div>
    </div>
  );
};

// Renderizar la aplicación
ReactDOM.render(<App />, document.getElementById('root'));