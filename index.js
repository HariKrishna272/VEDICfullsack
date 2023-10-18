var express = require('express');
var app = express();
const ejs = require('ejs');
const bp=require("body-parser");
app.use(bp.urlencoded({extended : true}));
app.use(bp.json());
app.set('view engine', 'ejs');
app.use(express.static('views'))
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore} = require('firebase-admin/firestore');
var admin = require("firebase-admin");
// import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-firestore.js";
var serviceAccount = require("./key.json");
var serviceAccount = require("./keys.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
app.get('/',  function (req, res) {  
   
   res.render("dash.ejs" );
  
  
})
app.get('/adlog',  function (req, res) {  
   
  res.render("adminlog.ejs" );
 
 
})

app.post('/varify',  function (req, res) {  
  
  console.log(req.body);
  db.collection('admin')
    .where('email', '==', req.body.email)
    .where('password', '==', req.body.password)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        //res.render("room.ejs");
        res.send(`<h3>your are not an admin <a href="/adlog">admin login</a></h3>`);
      }
      else
      {
       
       res.render("adminpage.ejs");
      }
  
    });
   
});
app.get('/sirs', async (req, res) => {
  // Retrieve data from Firestore
  

  
  try {
        const outingDetails = [];
        const snapshot = await db.collection('outing').get();

        snapshot.forEach(doc => {
            outingDetails.push({ id: doc.id, ...doc.data() });
        });

        res.render('allout.ejs', { outingDetails }); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }


});
//handling accept request
app.post('/accept/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const docRef = db.collection('outing').doc(id);
      await docRef.update({ status: 'Accepted' });
      console.log(`Accepted outing request with ID: ${id}`);

      const outingDetails = [];
      const snapshot = await db.collection('outing').get();
      snapshot.forEach(doc => {
          outingDetails.push({ id: doc.id, ...doc.data() });
      });

      res.render('allout.ejs', { outingDetails });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Handle reject request
app.post('/reject/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const docRef = db.collection('outing').doc(id);
      await docRef.update({ status: 'Rejected' });
      console.log(`Rejected outing request with ID: ${id}`);

      const outingDetails = [];
      const snapshot = await db.collection('outing').get();
      snapshot.forEach(doc => {
          outingDetails.push({ id: doc.id, ...doc.data() });
      });

      res.render('allout.ejs', { outingDetails });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/update',  function (req, res) {  
   
  res.render("updatemenu.ejs" ,{u:""});
  
 
 
}) 
app.post('/update', async  function (req, res) {  
  await db.collection("menu").doc("menus").update({
    dish1:req.body.dish1,
    dish2:req.body.dish2,
    dish3:req.body.dish3,
    dish4:req.body.dish4

  });
   
  res.render("updatemenu.ejs" ,{u:"menu was updated"});
  
 
 
}) 
app.get('/leave',  function (req, res) {  
   
  // res.render("updatemenu.ejs" ,{u:""});
  res.render("out.ejs",{o:""});
  
 
 
}) 
app.post('/leave', async (req, res) => {
  try {
    // const { name, roomNumber, dateTime, purpose, parentalApproval } = req.body;
    const name=req.body.name;
    const roomNumber=req.body.room;
    const dateTime=req.body.date;
    const purpose=req.body.purpose;
    // Store outing details in Firestore
    await db.collection('outing').add({
      name:name,
      roomno:roomNumber,
      date: dateTime,
      purpose:purpose,
      status:'__'
      
    });
     res.render("out.ejs",{o:"outing request was send"});
    // res.status(201).send('Outing details stored successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/menuboard', async function (req, res) {  
  const docRef = db.collection("menu").doc('menus');
  const docSnapshot = await docRef.get();
  console.log(docSnapshot.data());
  const s=docSnapshot.data();
  const menu = {
    dish1: s.dish1,
    dish2: s.dish2,
     dish3: s.dish3,
     dish4:s.dish4
  };
  
  // res.send("hii")
   res.render("notice.ejs",{menu} );
  
 
 
}) 

app.get('/login',  function (req, res) {  
   
  res.render("login.ejs" );
  
 
 
}) 
app.post('/signin',  function (req, res) {  
   
   console.log(req.body);
   const enteredPassword = req.body.password;
   const enteredEmail = req.body.mail;
   
   // Retrieve the hashed password from the database based on the provided email
      db.collection('login')
     .where('email', '==', enteredEmail)
     .get()
     .then((snapshot) => {
       if (snapshot.empty) {
         return res.send(`Login failed. User not found  <a href="/login"> plz Sign up </a>`);
       }
 
       const userData = snapshot.docs[0].data();
       const hashedPassword = userData.password;
       const name=userData.userid;
       // Compare the entered password with the hashed password
       bcrypt.compare(enteredPassword, hashedPassword, (err, result) => {
         if (err) {
           console.error(err);
           return res.status(500).send('Internal Server Error');
         }
 
         if (result) {
           // Passwords match, user is authenticated
           res.render("stlgaft.ejs",{user:name});
         } else {
           // Passwords do not match, login fails
           res.send(`Login failed. Incorrect password  <a href="/login"> Enter correct password </a>`);
         }
       });
     })
     .catch((error) => {
       console.error("Error querying database:", error);
       res.status(500).send("Internal Server Error");
     });
 
}) 
app.post('/signup', async function (req, res) {
  const plainPassword = req.body.password;
  const email = req.body.mail;
  const username = req.body.name;

  try {
    // Check if a user with the same email or username already exists
    const existingUser = await db.collection('login')
      .where('email', '==', email)
      .get();

    const existingUsername = await db.collection('login')
      .where('userid', '==', username)
      .get();

    if (!existingUser.empty || !existingUsername.empty) {
      return res.status(400).send(`<h2>User with the same email or username already exists <a href="/login"> Sign up agian with new details </a></h2>`);
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    // Create a new user document with the hashed password
    db.collection('login').add({
      userid: username,
      password: hashedPassword,
      email: email
    }).then(() => {
      res.send(` <h2>Sign up successful <a href="/login">login</a> </h2>`);
    }).catch((error) => {
      console.error("Error adding user:", error);
      res.status(500).send(`<h2>Error signing up  <a href="/login"> Sign up agian with new details </a></h2>`);
    });
  } catch (error) {
    console.error("Error checking for existing user or hashing password:", error);
    res.status(500).send("Error signing up");

  }
  
});


const db = getFirestore();
// app.get('/',  function (req, res) {  
   
//     // res.render("login.ejs" );
//      //res.render("room.ejs");
    
//   }) 
app.get('/blw',  function (req, res) {  
   const s={
          regno:"",
          user:"",
          room:""
   } 
  
   res.render("bet.ejs",{s});
  
    
});
app.get('/blw1',  function (req, res) {  
  const s={
         regno:"",
         user:"",
         room:""
  } 
 
  res.render("bet1.ejs",{s});
 
   
});
app.post('/blw1',  function (req, res) {  
  
  console.log(req.body);
  db.collection('store')
    .where('regno', '==', req.body.regno)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        //res.render("room.ejs");
        res.send("no room was booked please book your room");
      }
      else
      {
        const userData = snapshot.docs[0].data();
       console.log(userData)
       const s=userData;
       res.render("bet1.ejs",{s});
      }
  
    });
   
});

app.post('/allhostels',  function (req, res) {  
   
  console.log(req.body);
  db.collection('store')
    .where('regno', '==', req.body.regno)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        //res.render("room.ejs");
        res.render("hoste.ejs");
      }
      else
      {
        const userData = snapshot.docs[0].data();
       console.log(userData)
       const s=userData;
       res.render("bet.ejs",{s});
      }
     
      
      
    })
    .catch((error) => {
      console.error("Error querying database:", error);
      res.status(500).send("Internal Server Error");
    });
 
 
   
})

app.get('/book1',  function (req, res) {  
   
        // res.render("login.ejs" );
         res.render("bk.ejs",{b:""});
        
          
}) 
app.get('/book2',  function (req, res) {  
   
  // res.render("login.ejs" );
   res.render("bk2.ejs",{b:""});
  
    
}) 
app.get('/book3',  function (req, res) {  
   
  // res.render("login.ejs" );
   res.render("bk3.ejs",{b:""});
  
    
}) 
app.get('/book4',  function (req, res) {  
   
  // res.render("login.ejs" );
   res.render("bk4.ejs",{b:""});
  
    
}) 
app.get('/book5',  function (req, res) {  
   
  // res.render("login.ejs" );
   res.render("bk5.ejs",{b:""});
  
    
}) 
app.get('/book6',  function (req, res) {  
   
  // res.render("login.ejs" );
   res.render("bk6.ejs",{b:""});
  
    
}) 
app.get('/book7',  function (req, res) {  
   
  // res.render("login.ejs" );
   res.render("bk7.ejs",{b:""});
  
    
}) 
app.get('/book8',  function (req, res) {  
   
  // res.render("login.ejs" );
   res.render("bk8.ejs",{b:""});
  
    
}) 
app.get('/book9',  function (req, res) {  
   
  // res.render("login.ejs" );
   res.render("bk9.ejs",{b:""});
  
    
}) 
app.post('/101', async function (req, res) {
  const name=req.body.name;
  const reg=req.body.regno;
  try {
    const docRef = db.collection('asr').doc('room101');
    const docSnapshot = await docRef.get();
    let k = docSnapshot.data().full;
    
    if (k < 4) {
      if (docSnapshot.exists) {
        const d = docSnapshot.data();
        const e = d.r101;
        if(k==0){
        await db.collection("asr").doc("room101").update({
          r101: {
            bed2: name,
            bed3: e.bed3,
            bed4: e.bed4,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        db.collection('store').add({
          user: name,
          room: "Bed-2/-cvr-101" ,
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed : 2 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
      }
      else if(k==1){
        await db.collection("asr").doc("room101").update({
          r101: {
            bed1: name,
            bed3: e.bed3,
            bed4: e.bed4,
            bed2: e.bed2
          },
          full: d.full + 1
        });
        db.collection('store').add({
          user: name,
          room: "Bed-1/-cvr-101",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 1 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
        
          
      }
      else if(k==2){
        await db.collection("asr").doc("room101").update({
          r101: {
            bed4: name,
            bed3: e.bed3,
            bed2: e.bed2,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        db.collection('store').add({
          user: name,
          room: "Bed-4/-cvr-101",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 4 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
          
      }
       else{
        await db.collection("asr").doc("room101").update({
          r101: {
            bed3: name,
            bed2: e.bed2,
            bed4: e.bed4,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        db.collection('store').add({
          user: name,
          room: "Bed-3/-cvr-101",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 3 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
       }

      }
     
      else {
        console.log('No such document!');
      }
    } else {
      console.log("Rooms are completed");
    }

    

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Internal Server Error');
  }
 
});

app.post('/102', async function (req, res) {
  const name=req.body.name;
  const reg=req.body.regno;
  try {
    const docRef = db.collection('asr').doc('room102');
    const docSnapshot = await docRef.get();
    let k = docSnapshot.data().full;
    
    
    if (k < 4) {
      if (docSnapshot.exists) {
        const d = docSnapshot.data();
        const e = d.r102;
        if(k==0){
        await db.collection("asr").doc("room102").update({
          r102: {
            bed2: name,
            bed3: e.bed3,
            bed4: e.bed4,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        
        db.collection('store').add({
          user: name,
          room: "Bed-2/-cvr-102" ,
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed : 2 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
      }
      else if(k==1){
        await db.collection("asr").doc("room102").update({
          r102: {
            bed1: name,
            bed3: e.bed3,
            bed4: e.bed4,
            bed2: e.bed2
          },
          full: d.full + 1
        });
        db.collection('store').add({
          user: name,
          room: "Bed-1/-cvr-102",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 1 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
        
          
      }
      else if(k==2){
        await db.collection("asr").doc("room102").update({
          r102: {
            bed4: name,
            bed3: e.bed3,
            bed2: e.bed2,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        db.collection('store').add({
          user: name,
          room: "Bed-4/-cvr-102",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 4 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
          
      }
       else{
        await db.collection("asr").doc("room102").update({
          r102: {
            bed3: name,
            bed2: e.bed2,
            bed4: e.bed4,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        db.collection('store').add({
          user: name,
          room: "Bed-3/-cvr-102",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 3 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
       }

      }
     
      else {
        console.log('No such document!');
      }
    } else {
      console.log("Rooms are completed");
    }

  

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/103', async function (req, res) {
  const name=req.body.name;
  const reg=req.body.regno;
  try {
    const docRef = db.collection('asr').doc('room103');
    const docSnapshot = await docRef.get();
    let k = docSnapshot.data().full;
    
    if (k < 4) {
      if (docSnapshot.exists) {
        const d = docSnapshot.data();
        const e = d.r103;
        if(k==0){
        await db.collection("asr").doc("room103").update({
          r103: {
            bed2: name,
            bed3: e.bed3,
            bed4: e.bed4,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        
        db.collection('store').add({
          user: name,
          room: "Bed-2/-cvr-103",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed : 2 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
      }
      else if(k==1){
        await db.collection("asr").doc("room103").update({
          r103: {
            bed1: name,
            bed3: e.bed3,
            bed4: e.bed4,
            bed2: e.bed2
          },
          full: d.full + 1
        });
        db.collection('store').add({
          user: name,
          room: "Bed-1/-cvr-103",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 1 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
        
          
      }
      else if(k==2){
        await db.collection("asr").doc("room103").update({
          r103: {
            bed4: name,
            bed3: e.bed3,
            bed2: e.bed2,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        db.collection('store').add({
          user: name,
          room: "Bed-4/-cvr-103",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 4 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
          
      }
       else{
        await db.collection("asr").doc("room103").update({
          r103: {
            bed3: name,
            bed2: e.bed2,
            bed4: e.bed4,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        db.collection('store').add({
          user: name,
          room: "Bed-3/-cvr-103",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 3 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
       }

      }
     
      else {
        console.log('No such document!');
      }
    } else {
      console.log("Rooms are completed");
    }


  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/104', async function (req, res) {
  const name=req.body.name;
  const reg=req.body.regno;
  try {
    const docRef = db.collection('asr').doc('room104');
    const docSnapshot = await docRef.get();
    let k = docSnapshot.data().full;
    
    if (k < 4) {
      if (docSnapshot.exists) {
        const d = docSnapshot.data();
        const e = d.r104;
        if(k==0){
        await db.collection("asr").doc("room104").update({
          r104: {
            bed2: name,
            bed3: e.bed3,
            bed4: e.bed4,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        db.collection('store').add({
          user: name,
          room: "Bed-2/-cvr-104" ,
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed : 2 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
      }
      else if(k==1){
        await db.collection("asr").doc("room104").update({
          r104: {
            bed1: name,
            bed3: e.bed3,
            bed4: e.bed4,
            bed2: e.bed2
          },
          full: d.full + 1
        });
        db.collection('store').add({
          user: name,
          room: "Bed-1/-cvr-104",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 1 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
          
      }
      else if(k==2){
        await db.collection("asr").doc("room104").update({
          r104: {
            bed4: name,
            bed3: e.bed3,
            bed2: e.bed2,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        db.collection('store').add({
          user: name,
          room: "Bed-4/-cvr-104",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 4 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
          
      }
       else{
        await db.collection("asr").doc("room104").update({
          r104: {
            bed3: name,
            bed2: e.bed2,
            bed4: e.bed4,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        db.collection('store').add({
          user: name,
          room: "Bed-3/-cvr-104",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 3 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
       }

      }
     
      else {
        console.log('No such document!');
      }
    } else {
      console.log("Rooms are completed");
    }

    

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Internal Server Error');
  }
});
//r105
app.post('/105', async function (req, res) {
  const name=req.body.name;
  const reg=req.body.regno;
  try {
    const docRef = db.collection('asr').doc('room105');
    const docSnapshot = await docRef.get();
    let k = docSnapshot.data().full;
    
    if (k < 4) {
      if (docSnapshot.exists) {
        const d = docSnapshot.data();
        const e = d.r105;
        if(k==0){
        await db.collection("asr").doc("room105").update({
          r105: {
            bed2: name,
            bed3: e.bed3,
            bed4: e.bed4,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        db.collection('store').add({
          user: name,
          room: "Bed-2/-cvr-105" ,
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed : 2 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
        
      }
      else if(k==1){
        await db.collection("asr").doc("room105").update({
          r105: {
            bed1: name,
            bed3: e.bed3,
            bed4: e.bed4,
            bed2: e.bed2
          },
          full: d.full + 1
        });
        db.collection('store').add({
          user: name,
          room: "Bed-1/-cvr-105",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 1 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
        
       
          
      }
      else if(k==2){
        await db.collection("asr").doc("room105").update({
          r105: {
            bed4: name,
            bed3: e.bed3,
            bed2: e.bed2,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        
        db.collection('store').add({
          user: name,
          room: "Bed-4/-cvr-105",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 4 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
          
      }
       else{
        await db.collection("asr").doc("room105").update({
          r105: {
            bed3: name,
            bed2: e.bed2,
            bed4: e.bed4,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        
        db.collection('store').add({
          user: name,
          room: "Bed-3/-cvr-105",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 3 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
       }

      }
     
      else {
        console.log('No such document!');
      }
    } else {
      console.log("Rooms are completed");
    }


  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/106', async function (req, res) {
  const name=req.body.name;
  const reg=req.body.regno;
  try {
    const docRef = db.collection('asr').doc('room106');
    const docSnapshot = await docRef.get();
    let k = docSnapshot.data().full;
    
    if (k < 4) {
      if (docSnapshot.exists) {
        const d = docSnapshot.data();
        const e = d.r106;
        if(k==0){
        await db.collection("asr").doc("room106").update({
          r106: {
            bed2: name,
            bed3: e.bed3,
            bed4: e.bed4,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        
        db.collection('store').add({
          user: name,
          room: "Bed-1/-cvr-106",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 1 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
        
      }
      else if(k==1){
        await db.collection("asr").doc("room106").update({
          r106: {
            bed1: name,
            bed3: e.bed3,
            bed4: e.bed4,
            bed2: e.bed2
          },
          full: d.full + 1
        });
        
        db.collection('store').add({
          user: name,
          room: "Bed-1/-cvr-106",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 1 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
          
      }
      else if(k==2){
        await db.collection("asr").doc("room106").update({
          r106: {
            bed4: name,
            bed3: e.bed3,
            bed2: e.bed2,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        
        db.collection('store').add({
          user: name,
          room: "Bed-4/-cvr-106",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 4 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
          
      }
       else{
        await db.collection("asr").doc("room106").update({
          r106: {
            bed3: name,
            bed2: e.bed2,
            bed4: e.bed4,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        
        db.collection('store').add({
          user: name,
          room: "Bed-3/-cvr-106",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 3 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
       }

      }
     
      else {
        console.log('No such document!');
      }
    } else {
      console.log("Rooms are completed");
    }

    

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/107', async function (req, res) {
  const name=req.body.name;
  const reg=req.body.regno;
  try {
    const docRef = db.collection('asr').doc('room107');
    const docSnapshot = await docRef.get();
    let k = docSnapshot.data().full;
    
    if (k < 4) {
      if (docSnapshot.exists) {
        const d = docSnapshot.data();
        const e = d.r107;
        if(k==0){
        await db.collection("asr").doc("room107").update({
          r107: {
            bed2: name,
            bed3: e.bed3,
            bed4: e.bed4,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        
        db.collection('store').add({
          user: name,
          room: "Bed-2/-cvr-107" ,
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed : 2 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
      }
      else if(k==1){
        await db.collection("asr").doc("room107").update({
          r107: {
            bed1: name,
            bed3: e.bed3,
            bed4: e.bed4,
            bed2: e.bed2
          },
          full: d.full + 1
        });
        
        db.collection('store').add({
          user: name,
          room: "Bed-1/-cvr-107",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 1 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
        
          
      }
      else if(k==2){
        await db.collection("asr").doc("room107").update({
          r107: {
            bed4: name,
            bed3: e.bed3,
            bed2: e.bed2,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        
        db.collection('store').add({
          user: name,
          room: "Bed-4/-cvr-107",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 4 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
      }
       else{
        await db.collection("asr").doc("room107").update({
          r107: {
            bed3: name,
            bed2: e.bed2,
            bed4: e.bed4,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        
        db.collection('store').add({
          user: name,
          room: "Bed-3/-cvr-107",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 3 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
       }

      }
     
      else {
        console.log('No such document!');
      }
    } else {
      console.log("Rooms are completed");
    }

   

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/108', async function (req, res) {
  const name=req.body.name;
  const reg=req.body.regno;
  try {
    const docRef = db.collection('asr').doc('room108');
    const docSnapshot = await docRef.get();
    let k = docSnapshot.data().full;
    
    if (k < 4) {
      if (docSnapshot.exists) {
        const d = docSnapshot.data();
        const e = d.r108;
        if(k==0){
        await db.collection("asr").doc("room108").update({
          r108: {
            bed2: name,
            bed3: e.bed3,
            bed4: e.bed4,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        
        db.collection('store').add({
          user: name,
          room: "Bed-2/-cvr-108" ,
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed : 2 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
      }
      else if(k==1){
        await db.collection("asr").doc("room108").update({
          r108: {
            bed1: name,
            bed3: e.bed3,
            bed4: e.bed4,
            bed2: e.bed2
          },
          full: d.full + 1
        });
        
        db.collection('store').add({
          user: name,
          room: "Bed-1/-cvr-108",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 1 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
          
      }
      else if(k==2){
        await db.collection("asr").doc("room108").update({
          r108: {
            bed4: name,
            bed3: e.bed3,
            bed2: e.bed2,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        
        db.collection('store').add({
          user: name,
          room: "Bed-4/-cvr-108",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 4 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
          
      }
       else{
        await db.collection("asr").doc("room108").update({
          r108: {
            bed3: name,
            bed2: e.bed2,
            bed4: e.bed4,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        
        db.collection('store').add({
          user: name,
          room: "Bed-3/-cvr-108",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 3 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
       }

      }
     
      else {
        console.log('No such document!');
      }
    } else {
      console.log("Rooms are completed");
    }

    

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/109', async function (req, res) {
  const name=req.body.name;
  const reg=req.body.regno;
  try {
    const docRef = db.collection('asr').doc('room109');
    const docSnapshot = await docRef.get();
    let k = docSnapshot.data().full;
    
    if (k < 4) {
      if (docSnapshot.exists) {
        const d = docSnapshot.data();
        const e = d.r109;
        if(k==0){
        await db.collection("asr").doc("room109").update({
          r109: {
            bed2: name,
            bed3: e.bed3,
            bed4: e.bed4,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        db.collection('store').add({
          user: name,
          room: "Bed-2/-cvr-109" ,
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed : 2 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
        
      }
      else if(k==1){
        await db.collection("asr").doc("room109").update({
          r109: {
            bed1: name,
            bed3: e.bed3,
            bed4: e.bed4,
            bed2: e.bed2
          },
          full: d.full + 1
        });
        
        db.collection('store').add({
          user: name,
          room: "Bed-1/-cvr-109",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 1 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
        
          
      }
      else if(k==2){
        await db.collection("asr").doc("room109").update({
          r109: {
            bed4: name,
            bed3: e.bed3,
            bed2: e.bed2,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        
        db.collection('store').add({
          user: name,
          room: "Bed-4/-cvr-109",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 4 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
          
      }
       else{
        await db.collection("asr").doc("room109").update({
          r109: {
            bed3: name,
            bed2: e.bed2,
            bed4: e.bed4,
            bed1: e.bed1
          },
          full: d.full + 1
        });
        
        db.collection('store').add({
          user: name,
          room: "Bed-3/-cvr-109",
          regno: reg
        }).then(() => {
          res.render("bk8.ejs",{b:"Bed - 3 was booked for you"});
          
        }).catch((error) => {
          console.error("Error adding user:", error);
          res.status(500).send("Update error");
        });
       }

      }
     
      else {
        console.log('No such document!');
      }
    } else {
      console.log("Rooms are completed");
    }

    

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/cvr',  function (req, res) {  
 
  
  res.render("room.ejs");
   
}) 


app.listen(3000, function () {  
        console.log('Example app listening on port 3000!')  
        })

