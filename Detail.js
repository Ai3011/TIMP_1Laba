import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Detail = () => {
  const { id } = useParams();       //id типа инцидента для Detail страницы
  const navigate = useNavigate();  //навигация после изменения имени типа инцидента
  const nameRef = useRef(null);   // получение нужного нам поля, в данном случае name

  // 6d. фейк-токен
  useEffect(() => {
    if (!localStorage.getItem('authToken')) { //провеерка
      localStorage.setItem('authToken', 'dummy-token'); //создание
    }
  }, []);
  const token = localStorage.getItem('authToken'); //загружаем

  // 5a. Состояния компонента
  const [, setItem] = useState({ name: '' });  //строка имени типа инцидента
  const [loading, setLoading] = useState(false);  // 6c состояние спиннера загрузки
  const [error, setError] = useState('');         // 6b строка ошибок

  // 4a. Загрузка данных
  const fetchData = useCallback(async () => {
    setLoading(true); //включаем спиннер
    try {
      const response = await axios.get(  //получение json-ответа и преобразование в JS-объект response
        `http://localhost:5000/Type_incident/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItem(response.data); //меняем состяоние
      if (nameRef.current) { //проверка удалось ли получить поле name
        nameRef.current.value = response.data.name;  // выводим поле name
      }
    } catch (error) {
      // обработка по статусу ошибки сервера
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
    } finally {
      setLoading(false);  //выключаем спиннер
    }
  }, [id, token]);

  // 5b. Выгрузка данных при загрузке страницы
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  
  const handleSubmit = async (e) => {
    e.preventDefault(); //отменяем перезагрузку страницы
    const name = nameRef.current.value; // загружаем текущее имя  типа инцидента

    //6a. валидация
    if (name.trim().length === 0) {
      setError('Поле не может быть пустым или состоять только из пробелов');
      return;
    }
    if (name.length > 30) {
      setError('Название не должно превышать 30 символов');
      return;
    }
    const onlyLettersAndSpaces = /^[А-Яа-яЁёA-Za-z\s]+$/;
    if (!onlyLettersAndSpaces.test(name)) {
      setError('Поле должно содержать только буквы и пробелы');
      return;
    }

    // Если валидация прошла
    setLoading(true); //включаем спиннер
    setError('');//очищаем сообщение об ошибке
    const updatedData = { name: name.trim() };  // создаем Js-объект с полем name

    try {
      await axios.put( //преобразуем js-объект в json и отправляем
        `http://localhost:5000/Type_incident/${id}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Данные обновлены!');
      navigate('/');  //навигация на страницу Home
    } catch (error) {
      // обработка по статусу ошибки сервера
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setError('Некорректные данные. Проверьте ввод.');
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
    } finally {
      setLoading(false); //выключаем спиннер
    }
  };

  // Внутренние стили (оформление)
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

      <h1 style={styles.header}>Редактирование типа инцидента</h1>

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

export default Detail;