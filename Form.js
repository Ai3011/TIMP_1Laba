import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Form = () => {
  const navigate = useNavigate(); //создаем навигацию для возвращения к Home.js
  const nameRef = useRef(null);

  // 6d. Фейковый токен
  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      localStorage.setItem('authToken', 'dummy-token'); //создаем фейк токен
    }
  }, []);
  const token = localStorage.getItem('authToken'); //загружаем

  // 5a. Состояния компонента
  const [data, setData] = useState([]);       // список всех типов инцидентов для вычисления max_id
  const [loading, setLoading] = useState(false); // статус спиннера загрузки
  const [error, setError] = useState(''); //строка для ошибок

  // 4a. Загрузка списка для вычисления id
  useEffect(() => {
    const fetchList = async () => {
      setLoading(true); //включаем спиннер загрузки
      try {
        const res = await axios.get( //преобразуем json в JS-объект res
          'http://localhost:5000/Type_incident',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setData(res.data);  //сохраняем состояние
      } catch {
        setError('Ошибка загрузки списка');
      } finally {
        setLoading(false); //выклюааем спиннер загрузки
      }
    };
    fetchList();
  }, [token]);

  // 6a. Валидация (как в Detail.js)
  const validate = (name) => {
    if (name.trim().length === 0) {
      return 'Поле не может быть пустым или состоять только из пробелов';
    }
    if (name.length > 30) {
      return 'Название не должно превышать 30 символов';
    }
    const onlyLettersAndSpaces = /^[А-Яа-яЁёA-Za-z\s]+$/;
    if (!onlyLettersAndSpaces.test(name)) {
      return 'Поле должно содержать только буквы и пробелы';
    }
    return '';
  };

  // 4b, 6c–7. Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault(); // отмена перезагрузки

    const name = nameRef.current.value; // чтение введеного имени
    const validationError = validate(name); //валидация 
    if (validationError) { //если есть ошибки
      setError(validationError); //обновляем состояние строки ошибок
      return;
    }

    // 7. Вычисляем новый id = max(existing ids)+1, но сохраняем его как строку
    const maxId = data.length
      ? Math.max(...data.map(item => item.id)) //вычисляем максимальный id в db.json
      : 0;
    const newItem = {
      id: (maxId + 1).toString(), //формируем новый id = max_id+1
      name: name.trim()
    };

    setLoading(true); //включаем спиннер
    setError(''); //очищаем поле ошибок
    try {
      await axios.post( //преобразуем js-объект newItem в JSON 
        'http://localhost:5000/Type_incident',
        newItem,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Тип инцидента добавлен!');
      navigate('/'); //навигация к странице Home
    } catch (error) {
      // Обработка по коду ошибки сервера
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setError('Некорректные данные. Проверьте ввод.');
            break;
          case 404:
            setError('Ресурс не найден (404).');
            break;
          case 500:
            setError('Внутренняя ошибка сервера (500). Попробуйте позже.');
            break;
          default:
            setError(`Ошибка ${error.response.status}: ${error.response.statusText}`);
        }
      } else {
        // Если сервер не ответил (например, сеть недоступна)
        setError('Сетевая ошибка или сервер не отвечает.');
      }
    } finally {
      setLoading(false); // выключения спиннера
    }
  };

  // Внутренние стили (как в Detail.js)
  const styles = {
    container: {
      maxWidth: '500px',
      margin: '40px auto',
      padding: '0 20px',
      fontFamily: 'Arial, sans-serif',
    },
    header: {
      fontSize: '1.8rem',
      marginBottom: '20px',
      textAlign: 'center',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    label: {
      display: 'flex',
      flexDirection: 'column',
      fontSize: '1rem',
    },
    input: {
      padding: '8px',
      fontSize: '1rem',
      border: '1px solid #ccc',
      borderRadius: '4px',
      marginTop: '4px',
    },
    button: {
      padding: '10px 16px',
      fontSize: '1rem',
      border: 'none',
      borderRadius: '4px',
      backgroundColor: '#1976d2',
      color: '#fff',
      cursor: 'pointer',
      alignSelf: 'flex-start',
      transition: 'background 0.2s',
    },
    error: {
      color: '#d32f2f',
      marginBottom: '16px',
      textAlign: 'center',
    },
    spinner: {
      margin: '20px auto',
      width: '36px',
      height: '36px',
      border: '4px solid #e0e0e0',
      borderTop: '4px solid #1976d2',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
  };

  return (
    <div style={styles.container}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <h1 style={styles.header}>Добавление типа инцидента</h1>

      {loading && <div style={styles.spinner} />}
      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Название:
          <input
            type="text"
            ref={nameRef}
            style={styles.input}
          />
        </label>
        <button type="submit" style={styles.button}>Сохранить</button>
      </form>
    </div>
  );
};

export default Form;