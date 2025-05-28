const admin = require('firebase-admin');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const { faker } = require('@faker-js/faker');

const serviceAccount = require('./teanook-4e11d-firebase-adminsdk-fbsvc-a00d835a4f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'teanook-4e11d.firebasestorage.app' // replace with your bucket
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

const downloadImage = async (url, localPath) => {
  const response = await axios.get(url, { responseType: 'stream' });
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(localPath);
    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

const uploadToStorage = async (localPath, destination) => {
  const mimeType = mime.lookup(localPath);
  
  await bucket.upload(localPath, {
    destination,
    metadata: { contentType: mimeType }
  });
  const file = bucket.file(destination);
  await file.makePublic(); // or use getSignedUrl for access control
  return `https://storage.googleapis.com/${bucket.name}/${destination}`;
};

const createUsersWithRandomUserPhotos = async (count = 10) => {
  const csv = fs.createWriteStream('test-users.csv');
  csv.write('Email,Password,UID,ImageURL\n');

  for (let i = 0; i < count; i++) {
    const gender = faker.helpers.arrayElement(['male', 'female']);
    const photoIndex = Math.floor(Math.random() * 100);
    const imageUrl = `https://randomuser.me/api/portraits/${gender === 'male' ? 'men' : 'women'}/${photoIndex}.jpg`;
    const localFilename = `temp_${i}.jpg`;
    const localPath = path.join(__dirname, localFilename);

    try {
      await downloadImage(imageUrl, localPath);

      const storagePath = `profile-images/user_${Date.now()}_${i}.jpg`;
      const profileImage = await uploadToStorage(localPath, storagePath);

      const firstName = faker.person.firstName(gender);
      const lastName = faker.person.lastName();
      const email = faker.internet.email({ firstName, lastName });
      const password = 'Test1234!';
      const phone = faker.phone.number('(###) ###-####');
      const country = faker.location.country();
      const title = faker.helpers.arrayElement(['Consul General', 'Honorary Consul']);
      const status = faker.helpers.arrayElement(['Current', 'Emeritus']);
      const activeStatus = faker.datatype.boolean();

      const membershipPaymentAllowed = !activeStatus;
      const membershipPayment = activeStatus;
      const membershipPaymentDate = activeStatus ? new Date().toISOString() : '';
      const membershipPaymentYear = '2025';

      const user = await admin.auth().createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
      });

      await db.collection('users-ccoh').doc(user.uid).set({
        firstName,
        lastName,
        email,
        title,
        status,
        country,
        phoneNumber: phone,
        profileImage,
        isProfileComplete: true,
        activeStatus,
        membershipPaymentAllowed,
        membershipPayment,
        membershipPaymentDate,
        membershipPaymentYear
      });

      console.log(`✅ Created: ${email}`);
      csv.write(`${email},${password},${user.uid},${profileImage}\n`);

    } catch (err) {
      console.error(`❌ Error for image ${imageUrl}:`, err.message);
    } finally {
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath); // cleanup temp file
    }
  }

  csv.end();
  console.log('🎉 All users created with uploaded profile images.');
};

createUsersWithRandomUserPhotos(50);