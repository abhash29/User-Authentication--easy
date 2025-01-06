const express = require('express');
const app = express();
const fs = require('fs');
const port = 3000;

app.get('/', (req, res) => {
  res.send("Creating the course selling website using backend");
})

app.use(express.json());

let purchased = [];

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
app.put('/admin/courses/:id', adminAuthentication, (req, res) => {
  fs.readFile('courses.json', 'utf-8', (err, data) => {
    if (err) throw err;
    const COURSES = JSON.parse(data);
    const id = parseInt(req.params.id);

    const courseIndex = COURSES.findIndex(course => course.id === id);
    if (courseIndex !== -1) {
      const course = COURSES[courseIndex];
      Object.assign(course, req.body);

      fs.writeFile('courses.json', JSON.stringify(COURSES, null, 2), (err) => {
        if (err) throw err;
        res.status(200).json({ message: "Updated successfully" });
      });
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  });
});


//5. Admin courses ka list to get kar sakega
app.get('/admin/courses', adminAuthentication, (req, res) => {
  fs.readFile('courses.json', 'utf-8', (err, data) => {
    if(err) throw err;
    const COURSES = JSON.parse(data);
    res.json({course: COURSES});
  });
});

//6. Admin courses ko delete v kar sakta hai
app.delete('/admin/courses/:id', adminAuthentication, (req, res) => {
  fs.readFile('courses.json', 'utf-8', (err, data) => {
    if(err) throw err;
    const COURSES = JSON.parse(data);
    const id = req.params.id;

    const newCOURSES = COURSES.filter(course => course.id!=id);

    fs.writeFile('courses.json', JSON.stringify(newCOURSES), (err) => {
      if(err) throw err;
      res.status(200).json({message: "Course Deleted successfully"});
    });  
  });
});



//Users ke baare mai kaam karna hai
//1. User signup
app.post('/user/signup', (req, res) => {
  fs.readFile('users.json', 'utf-8', (err, data) => {
    if(err) throw err;
    const USER = JSON.parse(data);
    
    const user = {
      username: req.body.username,
      password: req.body.password,
      purchasedCOurses: []
    }

    USER.push(user);
    fs.writeFile('users.json', JSON.stringify(USER), (err) => {
      if(err) throw err;
      res.status(200).json({message: "User created successfully"});
    })
  })
})

//2. user login
//3. login ke liye middlewware
const userAuthentication = (req, res, next) => {
  const {username, password} = req.headers;
  fs.readFile('users.json', 'utf-8', (err, data) => {
    if(err) throw err;
    const USER = JSON.parse(data);
    const user = USER.find(a => a.username===username && a.password===password);
    if(user){
      return next();
    }
    else{
      res.status(403).json({message: "User Authentication failed"});
    }
  });
}
app.post('/user/login', userAuthentication, (req, res) => {
  res.status(200).json({message: "user login successful"});
})

//4. Users course dekh sakte h
app.get('/user/courses', userAuthentication, (req, res) => {
  fs.readFile('courses.json', 'utf-8', (err, data) => {
    if(err) throw err;
    const COURSES = JSON.parse(data);
    res.status(200).json({courses: COURSES});
  });
});


//5. Users course ko purchased mai add kar sakte h
app.post('/user/courses/:id', userAuthentication, (req, res) => {
  const id = parseInt(req.params.id);
  fs.readFile('courses.json', 'utf-8', (err, data) => {
    if(err) throw err;
    const COURSES = JSON.parse(data);
    const alreadyPurchased = purchased.find(a => a.id===id);
    const buy = COURSES.find(a => a.id===id);
    if(!alreadyPurchased && buy){  
      purchased.push(buy);
      res.status(200).json({message: "Coursed bought successfully"});
    }
    else{
      res.status(404).json({message: "Already purchased"});
    }
  });
});
//6. Purchased ka list
app.get('/users/purchasedCourses', userAuthentication, (req, res) => {
  const purchasedCourseIds = req.user.purchasedCourses; // e.g., [1, 4]
  
  fs.readFile('courses.json', 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading courses file", error: err.message });
    }

    const COURSES = JSON.parse(data);
    const purchasedCourses = COURSES.filter(course => purchasedCourseIds.includes(course.id));

    res.json({ purchasedCourses });
  });
});

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