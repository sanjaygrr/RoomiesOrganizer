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
    const [isSpinning, setIsSpinning] = React.useState(false);
    const [currentRoom, setCurrentRoom] = React.useState(null);
    const wheelRef = React.useRef(null);
  
    const roomNames = {
      pasillo: "Pasillo",
      baño: "Baño",
      living: "Living",
      cocina: "Cocina"
    };
  
    const roomOrder = ['pasillo', 'baño', 'living', 'cocina'];
  
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
  
    // Efecto para generar rotación
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
  
    const spinWheel = () => {
      if (isSpinning) return;
      
      setIsSpinning(true);
      setCurrentRoom(null);
      
      // Número aleatorio de rotaciones (entre 3 y 6 vueltas completas)
      const rotations = 3 + Math.random() * 3;
      const totalDegrees = rotations * 360;
      
      // Determina en qué sección caerá la ruleta (basado en el orden definido)
      const stopAt = Math.floor(Math.random() * roomOrder.length);
      const finalPosition = totalDegrees + (stopAt * 90); // 90 grados por cuadrante
      
      // Animación de giro
      if (wheelRef.current) {
        wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
        wheelRef.current.style.transform = `rotate(${finalPosition}deg)`;
        
        // Determinamos qué habitación ha sido seleccionada
        setTimeout(() => {
          // La habitación seleccionada es la que está en la parte superior cuando la ruleta se detiene
          setCurrentRoom(roomOrder[stopAt]);
          setIsSpinning(false);
        }, 4000);
      }
    };
  
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 p-4">
        <header className="bg-blue-600 text-white p-4 rounded-lg shadow-md mb-6">
          <h1 className="text-2xl font-bold text-center">Planificador de Limpieza del Hogar</h1>
          <div className="flex justify-center items-center mt-2">
            <button onClick={prevWeek} className="bg-blue-700 p-2 rounded-l-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw transform rotate-180"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M3 21v-5h5"></path></svg>
            </button>
            <div className="bg-blue-800 px-4 py-2">
              <span className="font-medium">Semana {currentWeek}</span>
            </div>
            <button onClick={nextWeek} className="bg-blue-700 p-2 rounded-r-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M3 21v-5h5"></path></svg>
            </button>
          </div>
        </header>
        
        {/* Ruleta simple dividida en 4 */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative w-80 h-80 mb-6">
            {/* Indicador de flecha - fijo en la parte superior */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <polygon points="20,40 0,0 40,0" fill="#ff7700" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.3))" />
              </svg>
            </div>
            
            {/* Ruleta simple */}
            <div 
              ref={wheelRef}
              className="w-80 h-80 rounded-full relative overflow-hidden shadow-lg border-2 border-gray-200"
              style={{ 
                transition: 'transform 0s cubic-bezier(0.17, 0.67, 0.12, 0.99)',
                background: 'white'
              }}
            >
              {/* Guardamos el orden correcto de las habitaciones en la ruleta */}
              {/* Pasillo (primer cuadrante) */}
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-yellow-500">
                <p className="absolute top-1/2 right-1/2 transform -translate-y-1/4 translate-x-1/4 text-white font-bold text-2xl -rotate-45">Pasillo</p>
              </div>
              
              {/* Baño (segundo cuadrante) */}
              <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-500">
                <p className="absolute bottom-1/2 right-1/2 transform translate-y-1/4 translate-x-1/4 text-white font-bold text-2xl rotate-45">Baño</p>
              </div>
              
              {/* Living (tercer cuadrante) */}
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-green-500">
                <p className="absolute bottom-1/2 left-1/2 transform translate-y-1/4 -translate-x-1/4 text-white font-bold text-2xl -rotate-45">Living</p>
              </div>
              
              {/* Cocina (cuarto cuadrante) */}
              <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-red-500">
                <p className="absolute top-1/2 left-1/2 transform -translate-y-1/4 -translate-x-1/4 text-white font-bold text-2xl rotate-45">Cocina</p>
              </div>
              
              {/* Líneas divisorias */}
              <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white"></div>
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-white"></div>
            </div>
          </div>
          
          <button 
            onClick={spinWheel}
            disabled={isSpinning}
            className={`flex items-center px-8 py-4 rounded-full text-white font-bold text-lg shadow-lg mb-6 ${
              isSpinning ? 'bg-gray-500' : 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700'
            }`}
            style={{ 
              transition: 'all 0.3s ease',
              boxShadow: isSpinning ? '0 4px 6px rgba(0,0,0,0.1)' : '0 10px 15px -3px rgba(88, 28, 135, 0.3), 0 4px 6px -2px rgba(88, 28, 135, 0.2)'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mr-2 ${isSpinning ? 'animate-spin' : ''}`}><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
            {isSpinning ? 'Girando...' : 'Girar Ruleta'}
          </button>
          
          {currentRoom && (
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center w-80 border-t-4 border-b-4 transform transition-all duration-300" 
                 style={{ 
                   borderTopColor: currentRoom === 'pasillo' ? '#facc15' : 
                                  currentRoom === 'baño' ? '#3b82f6' : 
                                  currentRoom === 'living' ? '#22c55e' : 
                                  '#ef4444',
                   borderBottomColor: currentRoom === 'pasillo' ? '#facc15' : 
                                      currentRoom === 'baño' ? '#3b82f6' : 
                                      currentRoom === 'living' ? '#22c55e' : 
                                      '#ef4444',
                   boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                 }}>
              <div className="text-2xl mb-1 font-bold">¡Habitación seleccionada!</div>
              <div className={`text-3xl font-bold my-3 ${
                currentRoom === 'pasillo' ? 'text-yellow-500' :
                currentRoom === 'baño' ? 'text-blue-500' :
                currentRoom === 'living' ? 'text-green-500' :
                'text-red-500'
              }`}>
                {roomNames[currentRoom]}
              </div>
              <div className="mt-2 text-gray-700 text-lg">
                Asignado a: <span className="font-bold">{getResidentNameById(assignments[currentRoom])}</span>
              </div>
            </div>
          )}
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {Object.keys(roomTasks).map(roomKey => (
            <div key={roomKey} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className={`p-4 text-white font-bold text-lg ${
                roomKey === 'pasillo' ? 'bg-yellow-500' :
                roomKey === 'baño' ? 'bg-blue-500' :
                roomKey === 'living' ? 'bg-green-500' :
                'bg-red-500'
              }`}>
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mr-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="m9 11 3 3L22 4"></path></svg>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
  
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4 7.55 4.24"></path><path d="M3.29 13.5c.14.52.36 1.05.65 1.54.9 1.63 2.5 2.71 4.34 2.92m8.76-4.09c-.58 2.1-2.3 3.68-4.44 4.09m-5.26-3.5h.01"></path><path d="M11.5 6c.4 0 .765.12 1.074.326.296.198.517.473.631.794a2 2 0 0 1 2.079 3.069"></path><path d="M9.03 11.739a2 2 0 0 1-2.428-2.96c.265-.225.576-.38.91-.454"></path><path d="M2 2l20 20"></path><path d="M6.5 14.5S5 16.5 6 18l.5.5"></path><path d="M12 18c.9.9 1.5 3 .5 5-.5-2-.5-3-1.5-3s-1 .5-1 .5"></path><path d="M14.5 20.5s1-1.5 3-1c-1.5.5-2 1-2 2s.5 1 .5 1"></path></svg>
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
  
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold mb-2 text-gray-700">Instrucciones</h2>
          <p className="text-gray-600 mb-2">
            Esta aplicación te ayuda a gestionar la rotación de tareas de limpieza semanalmente.
          </p>
          <ul className="list-disc pl-5 text-gray-600">
            <li>¡Gira la ruleta para seleccionar una habitación al azar!</li>
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