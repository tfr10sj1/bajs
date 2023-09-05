 // Import the functions you need from the SDKs you need
// Importera de nödvändiga funktionerna från Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-storage.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
 // TODO: Add SDKs for Firebase products that you want to use
 // https://firebase.google.com/docs/web/setup#available-libraries

 // Your web app's Firebase configuration
 // For Firebase JS SDK v7.20.0 and later, measurementId is optional
 const firebaseConfig = {
   apiKey: "AIzaSyDI_bZFy1g73Hq_SLZcgy3Y0w4SWPOmAu0",
   authDomain: "sns-jewllery.firebaseapp.com",
   databaseURL: "https://sns-jewllery-default-rtdb.europe-west1.firebasedatabase.app",
   projectId: "sns-jewllery",
   storageBucket: "sns-jewllery.appspot.com",
   messagingSenderId: "390632077656",
   appId: "1:390632077656:web:a5b84a0597da42c78c8d2d",
   measurementId: "G-VR33F4VQP4"
 };

 // Initialisera Firebase-appen
const app = initializeApp(firebaseConfig);

// Hämta en referens till Firebase Storage
const storage = getStorage(app);

// Hämta en referens till Firestore-databasen
const db = getFirestore(app);

// Funktion för att hämta och visa bilder och text från Firestore och Firebase Storage
async function getAndDisplayImages() {
  try {
   
    // Hämta bilder från Firestore
    const querySnapshot = await getDocs(collection(db, "webshop"));

    // Hämta bildbehållaren på sidan
    const imageContainer = document.getElementById("image-container");

    // Loopa igenom dokumenten i Firestore
    querySnapshot.forEach(async (doc) => {
      // Hämta data från Firestore-dokumentet
      const data = doc.data();
      const imageFilename = data.image_filename;

      // Skapa en länk runt bilden med rätt attribut för att skicka data till processImage.html
      const imageLink = document.createElement("a");
      imageLink.href = `processImage.html?image=${imageFilename}&id=${data.id}&metal_type=${data.metal_type}&name=${encodeURIComponent(data.name)}&price=${data.price}&weight=${data.weight}`;

      // Skapa en bild och sätt källan till den hämtade URL:en
      if (imageFilename) {
        const imageRef = ref(storage, "images/" + imageFilename);
        const imageUrl = await getDownloadURL(imageRef);
        const image = document.createElement("img");
        image.src = imageUrl;
        imageLink.appendChild(image);
      } else {
        console.error("Image name is undefined or missing in Firestore document.");
      }

      // Skapa element för att visa andra informationselement

      const metalTypeElement = document.createElement("p");
      metalTypeElement.textContent = "Metal Type: " + data.metal_type;

      const nameElement = document.createElement("p");
      nameElement.textContent = "Name: " + data.name;

      const weightElement = document.createElement("p");
      weightElement.textContent = "Weight: " + data.weight;

      const priceElement = document.createElement("p");
      priceElement.textContent = "Price: " + data.price;

      // Lägg till alla element i den överordnade containern

      imageLink.appendChild(metalTypeElement);
      imageLink.appendChild(nameElement);
      imageLink.appendChild(weightElement);
      imageLink.appendChild(priceElement);

      // Lägg till länken till bildbehållaren
      imageContainer.appendChild(imageLink);

    });
  } catch (error) {
    console.error("Error getting data from Firestore:", error);
  }
}

// Använd funktionen för att hämta och visa bilder och text
getAndDisplayImages();

document.addEventListener("DOMContentLoaded", function () {
  // Hämta alla bildlänkar
  var imageLinks = document.querySelectorAll(".image-link");

  // Lägg till en klickhändelsehanterare för varje bildlänk
  imageLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault(); // Förhindra standardlänkhantering

      // Hämta bildfilnamnet från data-attributet
      var imageFilename = link.getAttribute("data-image-filename");

      // Hämta produktinformationen från data-attributet
      var productInfo = JSON.parse(link.getAttribute("data-product-info"));

      // Spara produktinformationen och bildfilnamnet i localStorage
      localStorage.setItem("productInfo", JSON.stringify(productInfo));
      localStorage.setItem("imageFilename", imageFilename);

      // Gå till processImage.html
      window.location.href = "processImage.html";
    });
  });
});

// 1- Funktion för att läsa in produkter från Firestore till index.html
async function getWebshopFromFirestore() {
  try {
    const snapshot = await firebase.firestore().collection('webshop').get();
    const products = snapshot.docs.map(doc => doc.data());
    return products;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// 2- Funktion för att hämta bild-URL från Firebase Storage till index.html
async function getImageUrl(imageName) {
  try {
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child('images/' + imageName); // Ändra "images" till rätt Storage-sökväg
    const imageUrl = await imageRef.getDownloadURL();
    return imageUrl;
  } catch (error) {
    console.error(error);
    return null;
  }
}
//3- Funktion för att spara data i Realtime Database under "items" databasen
async function saveDataToItemsDatabase(itemData) {
  try {
    const databaseRef = firebase.database().ref('items');
    const newItemRef = databaseRef.push();
    await newItemRef.set(itemData);
    console.log('Data har sparats i Realtime Database.');
  } catch (error) {
    console.error(error);
    alert('Det uppstod ett fel. Försök igen senare.');
  }
}

saveDataToItemsDatabase(itemData);

//4- Funktion för att lagra en produktbild i "orders" i Firebase Storage
async function storeProductImageInOrders(imageName) {
  try {
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child('orders/' + imageName); // Ändra "orders" till rätt Storage-sökväg
    // Ladda upp bilden (exempelvis med uploadFile-metoden, som du måste implementera)
    // Efter uppladdning, returnera bild-URL
    const imageUrl = await imageRef.getDownloadURL();
    return imageUrl;
  } catch (error) {
    console.error(error);
    return null;
  }
}

//5a- Enklare version av addToCart utan kontroll för olika sessioner
async function addToCart(productInfo) {
  try {
    const cartRef = firebase.firestore().collection('carts').doc(userUid);
    const cartDoc = await cartRef.get();
    const cartData = cartDoc.data();

    const updatedCart = [...cartData.products, productInfo];
    await cartRef.update({ products: updatedCart });

    // Lista produkter med samma session_num som nuvarande produkt
    const productsInSameSession = listProductsBySession(productInfo.session_num);
    console.log('Produkter med samma session_num:', productsInSameSession);

    alert('Produkten har lagts till i varukorgen.');
  } catch (error) {
    console.error(error);
    alert('Det uppstod ett fel. Försök igen senare.');
  }
}

//5b- Funktion för att lista produkter med samma session_num
async function listProductsBySession(sessionNum) {
  try {
    const cartRef = firebase.firestore().collection('carts').doc(userUid);
    const cartDoc = await cartRef.get();
    const cartData = cartDoc.data();

    const productsInSameSession = cartData.products.filter(item => item.session_num === sessionNum);
    return productsInSameSession;
  } catch (error) {
    console.error(error);
    return [];
  }
}

//6- Funktion för att ta bort produkt från varukorgen och Firebase
async function removeProduct(productId, imageName) {
  try {
    // Ta bort produkten från varukorgen
    const cartRef = firebase.firestore().collection('carts').doc(userUid);
    const cartDoc = await cartRef.get();
    const cartData = cartDoc.data();
    
    const updatedCart = cartData.products.filter(item => item.id !== productId);
    await cartRef.update({ products: updatedCart });

    // Ta bort bilden från Firebase Storage
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child('orders/' + imageName); // Justera sökvägen om nödvändigt
    await imageRef.delete();

    alert('Produkten har tagits bort från varukorgen och bilden har tagits bort från Firebase Storage.');
    location.reload(); // Uppdatera sidan efter borttagning
  } catch (error) {
    console.error(error);
    alert('Det uppstod ett fel. Försök igen senare.');
  }
}

// Anropa showProducts() när dokumentet är laddat
document.addEventListener('DOMContentLoaded', showProducts);

// Lyssna på klick för att lägga till produkt i varukorgen
document.addEventListener('click', async function(event) {
  if (event.target.classList.contains('add-to-cart')) {
    const productInfo = {
      id: event.target.getAttribute('data-id'),
      name: event.target.getAttribute('data-name'),
      price: event.target.getAttribute('data-price'),
      weight: event.target.getAttribute('data-weight'),
      metal_type: event.target.getAttribute('data-metal_type'),
      image_url: event.target.getAttribute('data-image_url'),
      session_num: event.target.getAttribute('data-session_num')
    };
    await addToCart(productInfo);
  }
});

// Lyssna på klick för att ta bort produkt från varukorgen
document.addEventListener('click', async function(event) {
  if (event.target.classList.contains('remove-item')) {
    const itemId = event.target.getAttribute('data-item-id');
    await removeItemFromCart(itemId);
  }
});

// Lyssna på klick för att visa varukorgen
document.addEventListener('click', async function(event) {
  if (event.target.classList.contains('view-cart')) {
    showCart();
  }
});
