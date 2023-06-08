
import axios from 'axios';
import CryptoJS from 'crypto-js';
import moment from 'moment';



const API_URL = '/Apis/login/usuarios?tipo=Tractor';
const API_KEY = 'Y%MzJA:R}:G{=Q(U;wx6T';

export const getUnits = async () => {
  try {
    const headers = {
      'Content-Type': 'application/json; charset=UTF-8',
      Apikey: API_KEY,
    };

    const response = await axios.get(API_URL, { headers });

    console.log(response.data); // Imprimir el resultado en la consola

    if (response.status === 200) {
      const units = response.data.map((item) => ({
        value: item.eco,
        label: item.eco,
      }));
      return units;
    } else {
      console.log(response.statusText);
      return [];
    }
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
};

export const fetchChallenge = async () => {
  try {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    const requestBody = { clientId: 'cH9sKpjE36zt1yhVLz204YzgTAeFoR793zXhK-kY1lo26qXhyQfgK36p2QVt-RmVsDxS5ckUC8_pMVq2riAbhA' };
    const response = await axios.post('https://dataaccess.scania.com/auth/clientid2challenge/', requestBody, { headers });

    if (response.status === 200) {
      const result = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      const challenge = result.substring(result.indexOf(':') + 2, result.length - 2);
      console.log(`El challenge es: ${challenge}`);

      const secretKey = 'zGfOUrm9n3SHZJXoCTAOtiwQ0VtiW8W5raJqA1GiZsCND04JVNKUbCRsX6kCLad0Eum5ogacW_ymzD13JUYJaw';
      const secretKeyArr = base64url_decode(secretKey);
      const challengeArr = base64url_decode(challenge);
      const challengeResponse = CryptoJS.HmacSHA256(challengeArr, secretKeyArr);
      const encodedChallengeResponse = base64url_encode(challengeResponse);
      console.log(`El challenge response es: ${encodedChallengeResponse}`);

      return encodedChallengeResponse;
    }
  } catch (error) {
    console.error('Error en la solicitud:', error);
  }
};

function base64url_encode(arg) {
  var s = CryptoJS.enc.Base64.stringify(arg);
  s = s.split('=')[0];
  s = s.replace(/\+/g, '-');
  s = s.replace(/\//g, '_');
  return s;
}

function base64url_decode(arg) {
  var s = arg;
  s = s.replace(/-/g, '+');
  s = s.replace(/_/g, '/');
  switch (s.length % 4) {
    case 0: break;
    case 2: s += '=='; break;
    case 3: s += '='; break;
    default: console.log('Illegal base64url string!');
  }
  return CryptoJS.enc.Base64.parse(s);
}


export const fetchToken = async (challengeResponse) => {  
  try {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    const requestBody = {
      clientId: 'cH9sKpjE36zt1yhVLz204YzgTAeFoR793zXhK-kY1lo26qXhyQfgK36p2QVt-RmVsDxS5ckUC8_pMVq2riAbhA',
      Response: challengeResponse
    };
    const response = await axios.post('https://dataaccess.scania.com/auth/response2token/', requestBody, { headers });

    if (response.status === 200) {
      const data = response.data;
      const token = data.token;
      const refreshToken = data.refreshToken;

      console.log(`El token es: ${token}`);
      console.log(`El refreshToken es: ${refreshToken}`);

      return { token, refreshToken };
    } else {
      throw new Error(response.statusText);
    }
  } catch (error) {
    console.error('Error en la solicitud:', error);
    throw error;
  }
};


export const fetchData2 = async (selectedOption, marca, startDate, endDateN, vinOfInterest) => {
  try {
    const headers = { 'Content-Type': 'text/plain' };
    const requestBody = {
      data: {
        numerocamion: selectedOption.toString(),
        Apikey: "R%2T@F3qAP2x5/y;hUB.kWAtGPG]3b",
      }
    };
    const response = await axios.post('https://sistematpilot.com/Apis/Attpilot/archivomatcombu', requestBody, { headers });

    if (response.status === 200) {
      const jsonData = response.data;
      console.log(jsonData);

      const firstResult = jsonData[0];

      const marcaTrack = firstResult['marca'];
      marca = marcaTrack;

      const fechaSolicitud = firstResult['fechasolicitud'];

      if (marcaTrack === 'SCANIA') {
        const fechaSolicitudMoment = moment(fechaSolicitud);
        const formattedStartDate = fechaSolicitudMoment.format('YYYY-MM-DDHH:mm');
        const endDateNMoment = moment(endDateN);
        const formattedEndDateN = endDateNMoment.format('YYYY-MM-DDHH:mm');
  
        vinOfInterest = firstResult['vin'];
  
        console.log(`Fecha de solicitud: ${formattedStartDate}`);
        console.log(`Fecha final: ${formattedEndDateN}`);
        console.log(`VIN: ${vinOfInterest}`);
        console.log(`La marca es: ${marca}`);
  
        await SendToScania({
          startDate: formattedStartDate,
          endDateN: formattedEndDateN,
          vinOfInterest,

        });
  
        console.log('Es Scania');
      } else {
        const fechaSolicitudMoment = moment(fechaSolicitud);
        startDate = fechaSolicitudMoment.format('YYYY-MM-DDTHH:mm:ss-06:00');
        const endDateNMoment = moment(endDateN);
        endDateN = endDateNMoment.format('YYYY-MM-DDTHH:mm:ss-06:00');

        vinOfInterest = firstResult['vin'];


        console.log(`Fecha de solicitud: ${startDate}`);
        console.log(`Fecha final: ${endDateN}`);
        console.log(`VIN: ${vinOfInterest}`);
        console.log(`La marca es: ${marca}`);

        // Ejecutar las funciones correspondientes para otras marcas

        await fetchDataSam(startDate, endDateN);

         // Esperar un breve período antes de continuar
         await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log('No es Scania');
      }
    } else {
      console.log(`Request fallido: ${response.status}`);
    }
  } catch (error) {
    console.log(`Error al obtener los datos: ${error}`);
  }
};


export const SendToScania = async ({ startDate, endDateN, vinOfInterest, token, setFuelConsumed, setUreaConsumed }) => {
  try {

    const apiUrl = `https://dataaccess.scania.com/cs/vehicle/reports/VehicleEvaluationReport/v2?startDate=${startDate}&endDate=${endDateN}&vinOfInterest=${vinOfInterest}`;
    console.log(apiUrl);

    const headers = {
      Accept: 'application/vnd.fmsstandard.com.VehicleStatuses.v2.1+json; UTF-8',
      Authorization: 'Bearer ' + token,
    };
    console.log(headers);


    const response = await axios.get(apiUrl, { headers });

    if (response.status === 200) {
      const jsonData = response.data;
      const vehicleList = jsonData.VehicleList;
      console.log(vehicleList);
      const TotalFuelConsumptionApi = vehicleList[0].TotalFuelConsumption;
      const TotalUreaConsumptionApi = parseFloat(vehicleList[0].TotalFuelConsumption);

      setFuelConsumed(TotalFuelConsumptionApi);
      setUreaConsumed((TotalUreaConsumptionApi * 0.05).toFixed(0).toString());

      console.log(TotalFuelConsumptionApi);
    } else {
      console.log(`Request fallido: ${response.status}`);
    }
  } catch (error) {
    console.log(`Error al obtener los datos de scania: ${error}`);
  }
};


export const fetchDataSam = async (startDate, endDate, selectedOption) => {
  const apiUrl = '/api/fleet/reports/vehicles/fuel-energy'; // Ruta relativa en el proxy
  const apiToken = 'samsara_api_xWHgaJe2rOI0WVMVq38chmzFZiWyIm';

  const url = `${apiUrl}?startDate=${startDate}&endDate=${endDate}`;
  console.log(url);

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });

    if (response.status === 200) {
      const data = response.data;
      if (data['data']['vehicleReports'] !== null) {
        const filteredValue = data['data']['vehicleReports'];

        for (const vehicleReport of filteredValue) {
          const vehiculo = vehicleReport['vehicle']['name'];

          if (vehiculo === selectedOption) {
            const gas = vehicleReport['fuelConsumedMl'];
            const gasLitros = gas / 1000;
            const ureaLitros = gasLitros * 0.05;

            console.log(
              `Vehículo: ${vehiculo} - Litros de combustible: ${gasLitros} - Litros de urea: ${ureaLitros}`
            );
          }
        }
      } else {
        console.log('No se encontraron datos en la respuesta');
      }
    } else {
      console.log(startDate);
      console.log(endDate);
      console.log('...');
    }
  } catch (error) {
    console.log('Error al obtener los datos:', error);
  }
};

