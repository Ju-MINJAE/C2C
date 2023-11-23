import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import useFirestore from '../../hooks/useFirestore';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/esm/locale';
import { appStorage } from '../../firebase/confing';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ItemForm = ({ uid }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [ea, setEa] = useState('');
  const [description, setDescription] = useState('');
  const [rentuser, setRentUser] = useState('');
  const [startDateString, setStartDateString] = useState('');
  const [endDateString, setEndDateString] = useState('');
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [rentalPeriod, setRentalPeriod] = useState({
    startDate: new Date(),
    endDate: null,
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const { addDocument, response } = useFirestore('Sharemarket');

  const handleData = (event) => {
    if (event.target.id === 'tit') {
      setTitle(event.target.value);
    } else if (event.target.id === 'category') {
      setCategory(event.target.value);
    } else if (event.target.id === 'price') {
      setPrice(event.target.value);
    } else if (event.target.id === 'ea') {
      setEa(event.target.value);
    } else if (event.target.id === 'txt') {
      setDescription(event.target.value);
    } else if (event.target.id === 'rentuser') {
      setRentUser(event.target.value);
    }
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setRentalPeriod({ startDate: start, endDate: end });

    if (start) {
      setStartDateString(start.toISOString().split('T')[0]);
    }
    if (end) {
      setEndDateString(end.toISOString().split('T')[0]);
    }
    if (start && end) {
      setOpenDatePicker(false);
    }
  };
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      }
    });
  }, []);

  useEffect(() => {
    if (response.success) {
      setTitle('');
      setCategory('');
      setPrice('');
      setEa('');
      setDescription('');
      setRentUser('');
      setSelectedImage(null);
      setRentalPeriod({ startDate: new Date(), endDate: null });
    }
  }, [response]);

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let photoURL = null;

    if (selectedImage) {
      const storageRef = ref(appStorage, `images/${uid}/${selectedImage.name}`);

      try {
        await uploadBytes(storageRef, selectedImage);
        alert('image upload success');
        photoURL = await getDownloadURL(storageRef);
        console.log('Download URL:', photoURL);
      } catch (error) {
        alert('image upload ');
        return;
      }
    }

    const dataToSubmit = {
      uid,
      price,
      ea,
      title,
      description,
      category,
      rentuser,
      rentalPeriod,
      displayName: currentUser?.displayName,
      photoURL: photoURL,
    };
    // console.log('전송할 데이터:', dataToSubmit);
    console.log(dataToSubmit.photoURL);

    setTitle('');
    setCategory('');
    setPrice('');
    setEa('');
    setDescription('');
    setRentUser('');
    setSelectedImage(null);
    setRentalPeriod({ startDate: new Date(), endDate: null });

    addDocument(dataToSubmit);
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>상품 등록</legend>
          <ReactDatePicker
            id='rentalperiod'
            // locale='ko'
            // selected={rentalPeriod.startDate}
            startDate={rentalPeriod.startDate}
            endDate={rentalPeriod.endDate}
            selectsRange
            shouldCloseOnSelect={false}
            monthsShown={2}
            minDate={new Date()}
            dateFormat='yyyy년 MM월 dd일'
            onChange={handleDateChange}
            open={openDatePicker}
            onInputClick={() => setOpenDatePicker(true)}
          />
          <input
            type='file'
            id='imageInput'
            accept='image/*'
            onChange={handleImageChange}
          />
          <input
            placeholder='제목'
            id='tit'
            type='text'
            value={title}
            required
            onChange={handleData}
          />
          <select id='category' value={category} onChange={handleData} required>
            <option>카테고리</option>
            <option value='가전'>가전</option>
            <option value='여행'>여행</option>
            <option value='의류'>의류</option>
            <option value='취미'>취미</option>
          </select>
          <input
            placeholder='가격'
            id='price'
            type='number'
            value={price}
            required
            onChange={handleData}
            min='5000'
            step='1000'
          />
          <input
            placeholder='수량'
            id='ea'
            type='number'
            value={ea}
            required
            onChange={handleData}
            min='1'
            step='1'
          />
          <textarea
            placeholder='대여하는 사람을 위해 자세히 적어주세요.'
            id='txt'
            type='text'
            value={description}
            required
            onChange={handleData}
          />

          <button type='submit'>제출</button>
        </fieldset>
      </form>
    </>
  );
};

export default ItemForm;
