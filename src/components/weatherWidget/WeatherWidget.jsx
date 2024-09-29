import { useState, useEffect } from 'react';
import './WeatherWidget.css';

import sunnyVideo from './Data/sunny.mp4';
import cloudyVideo from './Data/clouds.mp4';
import snowyVideo from './Data/snow.mp4';
import rainyVideo from './Data/rainy.mp4';


export default function WeatherWidget() {
    const [temperature, setTemperature] = useState(null);
    const [description, setDescription] = useState('');
    const [city, setCity] = useState('');
    const [videoSrc, setVideoSrc] = useState();
    const [errorMessage, setErrorMessage] = useState('');

    // Получаем геолокацию пользователя при первом рендере компонента
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
        } else {
            setErrorMessage("Геолокация не поддерживается этим браузером.");
        }
    }, []);

    // Изменяем источник видео в зависимости от погоды
    useEffect(() => {
        if (description) {
            if (description.includes("clear")) {
                setVideoSrc(sunnyVideo); // Солнце
            } else if (description.includes("rain")) {
                setVideoSrc(rainyVideo); // Дождь
            } else if (description.includes("cloud")) {
                setVideoSrc(cloudyVideo); // Облака
            } else if (description.includes("snow")) {
                setVideoSrc(snowyVideo); // Снег
            } else {
                setVideoSrc(sunnyVideo); // Видео по умолчанию
            }
        }
    }, [description]);

    // Успешный колбек для получения геолокации
    function successCallback(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const apiKey = 'fabf13cddd3a369495af4acdb1c269b7';

        // Запрос для получения информации о городе
        const geoApiUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;
        fetch(geoApiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    setCity(data[0].name);
                } else {
                    setErrorMessage('Не удалось определить название города.');
                }
            })
            .catch(error => {
                setErrorMessage('Ошибка при получении данных о местоположении: ' + error.message);
            });

        // Запрос для получения информации о погоде
        const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
        fetch(weatherApiUrl)
            .then(response => response.json())
            .then(data => {
                setTemperature(data.main.temp);
                setDescription(data.weather[0].description);
            })
            .catch(error => {
                setErrorMessage('Ошибка при получении данных о погоде: ' + error.message);
            });
    }

    // Ошибки при получении геолокации
    function errorCallback(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                setErrorMessage("Пользователь запретил доступ к геолокации.");
                break;
            case error.POSITION_UNAVAILABLE:
                setErrorMessage("Информация о местоположении недоступна.");
                break;
            case error.TIMEOUT:
                setErrorMessage("Запрос на получение местоположения занял слишком много времени.");
                break;
            default:
                setErrorMessage("Произошла неизвестная ошибка.");
                break;
        }
    }

    return (
        <div className="widgetContainer">
            {errorMessage ? (
                <p>{errorMessage}</p>
            ) : (
                <>
                    {/* Видео фон */}
                    {videoSrc && (
                        <video autoPlay loop muted className="background-video">
                            <source src={videoSrc} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    )}
                    <p>Город: {city || 'Загрузка...'}</p>
                    <p>Температура: {temperature !== null ? `${temperature}°C` : 'Загрузка...'}</p>
                    <p>Описание: {description || 'Загрузка...'}</p>
                </>
            )}
        </div>
    );
}
