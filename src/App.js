import React, { useEffect, useState } from 'react';
import './App.css';
import { getUnits, fetchChallenge, fetchToken, fetchData2, SendToScania } from './api';



const App = () => {
  const [showDiv, setShowDiv] = useState(false);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [endDateN, setEndDateN] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [encodedChallengeResponse, setEncodedChallengeResponse] = useState('');
  const [token, setToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [vinOfInterest, setVinOfInterest] = useState('');
  const [marca, setMarca] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');
  const [ureaConsumed, setUreaConsumed] = useState('');
  

  useEffect(() => {
    const loadData = async () => {
      const units = await getUnits();
      setOptions(units);
      const encodedChallengeResponse = await fetchChallenge();
      setEncodedChallengeResponse(encodedChallengeResponse);
      getToken(encodedChallengeResponse);
    };

    loadData();
  }, []);

  const getToken = async (challengeResponse) => {
    try {
      const { token, refreshToken } = await fetchToken(challengeResponse);
      setToken(token);
      setRefreshToken(refreshToken);
    } catch (error) {
      console.error('Error al obtener el token:', error);
    }
  };

  const handleClick = async () => {
    const currentDateTime = new Date().toLocaleString();
    setEndDateN(currentDateTime);

    await fetchData2(selectedOption, marca, startDate, currentDateTime, vinOfInterest);

    await SendToScania({
      startDate,
      endDateN: currentDateTime,
      vinOfInterest,
      token,

    });

    setShowDiv(true);
  };

  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
    setSearchTerm('');
  };

  return (
    <div className="container">
      <div className="centered-div">
        <div className="container-flex">
          <select value={selectedOption} onChange={handleSelectChange}>
            {options
              .filter((option) =>
                option.label.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar opción"
          />
          <button onClick={handleClick}>Enviar</button>
        </div>
        {showDiv && (
          <div className="inner-div">
            La fecha y hora actuales son: {endDateN}
            <br />
            El response challenge es: {encodedChallengeResponse}
            <br />
            La unidad es: {selectedOption}
            <br />
            El refreshToken es: {refreshToken}
            <br />
            Fecha de solicitud: {startDate}
            <br />
            Fecha final: {endDate}
            <br />
            VIN: {vinOfInterest}
            <br />
            La marca es: {marca}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
