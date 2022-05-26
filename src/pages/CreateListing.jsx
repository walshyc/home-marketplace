import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

const CreateListing = () => {
  const [loading, setLoading] = useState(false);
  const [geoLocationEnabled, setGeoLocationEnabled] = useState(true);
  const [formData, setFormData] = useState({
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0,
  });

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData;

  const auth = getAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid });
        } else {
          navigate('/sign-in');
        }
      });
    }

    return () => {
      isMounted.current = false;
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, auth]);

  const onMutate = (e) => {
    let boolean = null;

    // booleans
    if (e.target.value === 'true') {
      boolean = true;
    } else if (e.target.value === 'false') {
      boolean = false;
    }

    // Files
    if (e.target.files) {
      setFormData((prevState) => ({ ...prevState, images: e.target.files }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log(discountedPrice);
    if (+discountedPrice >= +regularPrice) {
      setLoading(false);
      toast.error('Discounted price must be less than regular price');
      return;
    }

    if (images.length > 6) {
      setLoading(false);
      toast.error('You can only upload max 6 images');
      return;
    }
    let geolocation = {};
    let location;

    if (geoLocationEnabled) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GOOGLE_API_KEY}`
      );

      const data = await response.json();
      console.log(data);

      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;

      location =
        data.status === 'ZERO_RESULTS'
          ? undefined
          : data.results[0]?.formatted_address;

      if (location === undefined || location.includes('undefined')) {
        setLoading(false);
        toast.error('Please enter a correct address');
        return;
      }
    } else {
      geolocation.lat = latitude;
      geolocation.lng = longitude;

      console.log(geolocation, location);
    }
    // function to store images in firebase
    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;

        const storageRef = ref(storage, 'images/' + fileName);

        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused');
                break;
              case 'running':
                console.log('Upload is running');
                break;
            }
          },
          (error) => {
            reject(error);
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    };

    const imageUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch((err) => {
      setLoading(false);
      console.log(err);
      toast.error('Error uploading images');
      return;
    });

    const formDataCopy = {
      ...formData,
      imgUrls: imageUrls,
      geolocation,
      timestamp: serverTimestamp(),
    };
    formDataCopy.location = address;
    delete formDataCopy.images;
    delete formDataCopy.address;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    const docRef = await addDoc(collection(db, 'listings'), formDataCopy);
    setLoading(false);
    toast.success('Listing created successfully');
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

  if (loading) {
    return <Spinner></Spinner>;
  }

  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Create a listing</p>
      </header>
      <main>
        <form onSubmit={onSubmit}>
          <label htmlFor="" className="formLabel">
            Sell / Rent
          </label>
          <div className="formButtons">
            <button
              type="button"
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              id="type"
              value="sale"
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              type="button"
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              id="type"
              value="rent"
              onClick={onMutate}
            >
              Rent
            </button>
          </div>
          <label htmlFor="" className="formLabel">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="formInputName"
            value={name}
            maxLength={32}
            minLength={10}
            required
            onChange={onMutate}
          />
          <div className="formRooms flex">
            <div className="">
              <label htmlFor="" className="formLabel">
                Bedrooms
              </label>
              <input
                type="number"
                id="bedrooms"
                className="formInputSmall"
                value={bedrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
            <div className="">
              <label htmlFor="" className="formLabel">
                Bathrooms
              </label>
              <input
                type="number"
                id="bathrooms"
                className="formInputSmall"
                value={bathrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
          </div>

          <label htmlFor="" className="formLabel">
            Parking Spot
          </label>
          <div className="formButtons">
            <button
              type="button"
              className={parking ? 'formButtonActive' : 'formButton'}
              id="parking"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              className={!parking ? 'formButtonActive' : 'formButton'}
              id="parking"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label htmlFor="" className="formLabel">
            Furnished
          </label>
          <div className="formButtons">
            <button
              type="button"
              className={furnished ? 'formButtonActive' : 'formButton'}
              id="furnished"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              className={!furnished ? 'formButtonActive' : 'formButton'}
              id="furnished"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label htmlFor="" className="formLabel">
            Address
          </label>
          <textarea
            id="address"
            type="text"
            value={address}
            onChange={onMutate}
            required
            className="formInputAddress"
          ></textarea>

          {!geoLocationEnabled && (
            <div className="formLatLng flex">
              <div className="">
                <label className="formLabel">Latitute</label>
                <input
                  type="number"
                  id="latitude"
                  value={latitude}
                  onChange={onMutate}
                  required
                  className="formInputSmall"
                />
                <label className="formLabel">Longitude</label>
                <input
                  type="number"
                  id="longitude"
                  value={longitude}
                  onChange={onMutate}
                  required
                  className="formInputSmall"
                />
              </div>
            </div>
          )}

          <label htmlFor="" className="formLabel">
            Offer
          </label>
          <div className="formButtons">
            <button
              type="button"
              className={offer ? 'formButtonActive' : 'formButton'}
              id="offer"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              className={!offer ? 'formButtonActive' : 'formButton'}
              id="offer"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label htmlFor="" className="formLabel">
            Regular Price
          </label>
          <div className="formPriceDiv">
            <input
              className="formInputSmall"
              type="number"
              id="regularPrice"
              value={regularPrice}
              onChange={onMutate}
              min="50"
              max="750000000"
              required
            />
            {type === 'rent' && <p className="formPriceText">€ / month</p>}
          </div>
          {offer && (
            <>
              <label htmlFor="" className="formLabel">
                Discounted Price
              </label>
              <div className="formPriceDiv">
                <input
                  className="formInputSmall"
                  type="number"
                  id="discountedPrice"
                  value={discountedPrice}
                  onChange={onMutate}
                  min="50"
                  max="750000000"
                  required={offer}
                />
              </div>
            </>
          )}
          <label htmlFor="" className="formLabel">
            Images
          </label>
          <p className="imagesInfo">
            The first image will be the cover (max 6).
          </p>
          <input
            type="file"
            onChange={onMutate}
            max="6"
            accept=".jpg,.png,.jpeg"
            id="images"
            className="formInputFile"
            multiple
            required
          />
          <button className="primaryButton createListingButton" type="submit">
            Create Listing
          </button>
        </form>
      </main>
    </div>
  );
};

export default CreateListing;
