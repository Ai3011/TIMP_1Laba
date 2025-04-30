import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  useEffect(() => {
    if (!localStorage.getItem('authToken')) { //6d. фейк-токен
      localStorage.setItem('authToken', 'dummy-token');
    }
  }, []);

  const token = localStorage.getItem('authToken'); // 6d. получаем токен
 
  //Состояния
  const [data, setData] = useState([]); //4а массив типов инцидентов               
  const [loading, setLoading] = useState(false); //6с. спиннер     
  const [error, setError] = useState('');             //6b строка для вывода ошибок
  const [hovered, setHovered] = useState(null);       // выделение элемента при навождении на него мышкой

    const loadData = useCallback(async () => {
    setLoading(true);                           // 6c.спиннер становится true (включается)
    try {
      const response = await axios.get(
        'http://localhost:5000/Type_incident',
        { headers: { Authorization: `Bearer ${token}` } } //передача фейкового токена
      );
      setData(response.data);                   // 4a. + 4c. сохраняем и далее рендерим
    } catch (error) {
      // обработка по статусу ошибки сервера
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setError('Некорректный запрос (400).');
            break;
          case 404:
            setError('Ресурс не найден (404).');
            break;
          case 500:
            setError('Ошибка сервера (500). Попробуйте позже.');
            break;
          default:
            setError(`Ошибка ${error.response.status}: ${error.response.statusText}`);
        }
      } else {
        // если сервер не ответил 
        setError('Сетевая ошибка или сервер не отвечает.');
      }
    } finally {
      setLoading(false);                        // 6c. выключаем спиннер
    }
  }, [token]);

  
  // 5b. Автоматический ре-рендер UI при изменении loadData
  useEffect(() => {
    loadData();
  }, [loadData]);

  const deleteItem = async (id) => {
    if (!window.confirm('Удалить инцидент?')) return;  //окно доп подтверждения удаления
    try {
      await axios.delete( //удаление
        `http://localhost:5000/Type_incident/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(prev => prev.filter(incident => incident.id !== id)); // 5b. после успешного удаления обновляем state
    } catch (error) {
      // обработка по коду ошибки сервера
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setError('Некорректный запрос (400).');
            break;
          case 404:
            setError('Тип инцидента не найден (404).');
            break;
          case 500:
            setError('Ошибка сервера (500). Попробуйте позже.');
            break;
          default:
            setError(`Ошибка ${error.response.status}: ${error.response.statusText}`);
        }
      } else {
        // если сервер не ответил (например, сеть недоступна)
        setError('Сетевая ошибка или сервер не отвечает.');
      }
    }
  };

  // Внутренние стили
  const styles = {
    container: { maxWidth: '600px', margin: '40px auto', padding: '0 20px', fontFamily: 'Arial, sans-serif' },
    header:    { fontSize: '2rem', marginBottom: '20px', textAlign: 'center' },
    list:      { listStyle: 'none', padding: 0 },
    listItem:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                 padding: '12px 8px', borderBottom: '1px solid #e0e0e0', transition: 'background 0.2s', cursor: 'pointer' },
    link:      { textDecoration: 'none', color: '#333' },
    button:    { marginLeft: '10px', padding: '4px 8px', border: 'none', borderRadius: '4px',
                 cursor: 'pointer', backgroundColor: '#1976d2', color: '#fff', transition: 'background 0.2s' },
    addLink:   { display: 'inline-block', marginTop: '20px', padding: '8px 16px',
                 border: 'none', borderRadius: '4px', textDecoration: 'none',
                 backgroundColor: '#1976d2', color: '#fff', cursor: 'pointer', transition: 'background 0.2s' },
    error:     { color: '#d32f2f', marginBottom: '16px', textAlign: 'center' },
    spinner:   { margin: '40px auto', width: '40px', height: '40px',
                 border: '4px solid #e0e0e0', borderTop: '4px solid #1976d2',
                 borderRadius: '50%', animation: 'spin 1s linear infinite' },
  };

  return (
    <div style={styles.container}>
      {/* 6c. Спиннер: встраиваем ключевые кадры */}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <h1 style={styles.header}>Тип инцидента</h1>

      {/* 6c. Индикатор загрузки */}
      {loading && <div style={styles.spinner} />}

      {/* 6b. Показ ошибок */}
      {error && <div style={styles.error}>{error}</div>}

      {/* 4c. Рендерим список из JSON (список → элементы UI) */}
      <ul style={styles.list}>
        {data.map((incident, idx) => (
          <li
            key={incident.id}
            style={{ 
              ...styles.listItem,
              ...(hovered === idx ? { backgroundColor: '#f9f9f9' } : {})
            }}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
          >
            <Link to={`/detail/${incident.id}`} style={styles.link}>
              {incident.name}
            </Link>
            <button onClick={() => deleteItem(incident.id)} style={styles.button}>
              Удалить
            </button>
          </li>
        ))}
      </ul>

      <Link to="/add" style={styles.addLink}>
        Добавить инцидент
      </Link>

    </div>
  );
};

export default Home;