const express = require('express');
const app = express();
const fs = require('fs');
const port = 3000;

app.get('/', (req, res) => {
  res.send("Creating the course selling website using backend");
})

app.use(express.json());

// 1. Admins should be able to sign up
app.post('/admin/signup', (req, res) => {
  const admin = req.body;
  fs.readFile('admins.json', "utf-8", (err, data) => {
      if(err) throw err;
      const ADMIN = JSON.parse(data);
      let existingAdmin = false;
      for(let i=0; i<ADMIN.length; i++){
        if(ADMIN[i].username===admin.username){
          existingAdmin = true;
          break;
        }
      }
      if(existingAdmin){
        res.status(403).json({message: "Admin already exists"});
      }
      else{
        ADMIN.push(admin);
       fs.writeFile("admins.json", JSON.stringify(ADMIN), (err) => {
        if(err) throw err;
        res.status(200).json({message: "Admin created successfully"});
       });
      }
  });
});

//2. Number of admins present
app.get('/admins', (req, res) => {
  fs.readFile("admins.json", "utf-8", (err, data) => {
    if(err) throw err;
    const ADMIN = JSON.parse(data || '[]');
    res.status(200).json({admins: ADMIN});
  });
});

//2. Admins ka login
//Middleware -> Jo authenticate karne ka kaam karega
const adminAuthentication = (req, res, next) => {
  fs.readFile('admins.json', 'utf-8', (err, data) => {
    if(err) throw err;
    const ADMIN = JSON.parse(data);
    const {username, password} = req.headers;
    const admins = ADMIN.find(a => a.username===username && a.password===password);
    if(admins){
      return next();
    }
    else{
      res.status(403).json({message: "Admin Authentication failed"});
    }
  });
};
app.post('/admin/login', adminAuthentication, (req, res) => {
  res.status(200).json({message: 'Admin login successfully'})
});



//Yaha se check karna hai
//3. Admin courses ko daal sakega
app.post('/admin/courses', adminAuthentication, (req, res) => {
  const course = req.body;
  course.id = Date.now();
  fs.readFile('courses.json', 'utf-8', (err, data) => {
    if(err) throw err;
    const COURSES = JSON.parse(data);
    COURSES.push(course);
    

    fs.writeFile('courses.json', JSON.stringify(COURSES), (err) => {
      if(err) throw err;
    res.status(200).json({message: "Course added successfully"});
  });
  });
});
//4. Admin courses mai changes la sakega
//5. Admin courses ka list to get kar sakega
app.get('/admin/courses', adminAuthentication, (req, res) => {
  fs.readFile('courses.json', 'utf-8', (err, data) => {
    if(err) throw err;
    const COURSES = JSON.parse(data);
    res.json({course: COURSES});
  });
});

//6. Admin courses ko delete v kar sakta hai
app.delete('')


app.listen(port, () => {
  console.log(`Port is running at ${port}`);
})
















// const express = require('express');
// const { link } = require('fs');
// const { uptime } = require('process');
// const app = express();

// app.use(express.json());

// let ADMINS = [];
// let USERS = [];
// let COURSES = [];

// // Admin routes
// app.post('/admin/signup', (req, res) => {
//   // logic to sign up admin
// });

// app.post('/admin/login', (req, res) => {
//   // logic to log in admin
// });

// app.post('/admin/courses', (req, res) => {
//   // logic to create a course
// });

// app.put('/admin/courses/:courseId', (req, res) => {
//   // logic to edit a course
// });

// app.get('/admin/courses', (req, res) => {
//   // logic to get all courses
// });

// // User routes
// app.post('/users/signup', (req, res) => {
//   // logic to sign up user
// });

// app.post('/users/login', (req, res) => {
//   // logic to log in user
// });

// app.get('/users/courses', (req, res) => {
//   // logic to list all courses
// });

// app.post('/users/courses/:courseId', (req, res) => {
//   // logic to purchase a course
// });

// app.get('/users/purchasedCourses', (req, res) => {
//   // logic to view purchased courses
// });

// app.listen(3000, () => {
//   console.log('Server is listening on port 3000');
// });



// //Creating a course selling website

// // Description: 
// // 1. Admins should be able to sign up
// // 2. Admins should able to create COURSES
// //     -> Courses has a title, description, price and image link
// //     -> Courses should be able to published