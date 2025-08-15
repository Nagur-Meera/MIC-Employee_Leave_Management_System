const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected for seeding'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Sample users data
const users = [
  {
    name: 'Dr. Rajesh Kumar',
    email: 'admin@mic.edu',
    password: 'admin123',
    role: 'admin',
    department: 'Computer Science & Engineering (CSE)',
    designation: 'System Administrator',
    qualification: 'Ph.D. in Computer Science, M.Tech CSE',
    mobileNo: '9876543210',
    dateOfBirth: '1985-01-15',
    dateOfJoining: '2020-01-01'
  },
  {
    name: 'Dr. Priya Sharma',
    email: 'hod.cse@mic.edu',
    password: 'hod123',
    role: 'hod',
    department: 'Computer Science & Engineering (CSE)',
    designation: 'Head of Department',
    qualification: 'Ph.D. in Computer Science & Engineering, M.Tech CSE',
    mobileNo: '9876543211',
    dateOfBirth: '1980-03-20',
    dateOfJoining: '2018-06-01'
  },
  {
    name: 'Dr. Suresh Reddy',
    email: 'hod.ece@mic.edu',
    password: 'hod123',
    role: 'hod',
    department: 'Electronics & Communication Engineering (ECE)',
    designation: 'Head of Department',
    qualification: 'Ph.D. in Electronics & Communication Engineering, M.Tech ECE',
    mobileNo: '9876543213',
    dateOfBirth: '1978-05-12',
    dateOfJoining: '2017-08-01'
  },
  {
    name: 'Prof. Amit Singh',
    email: 'amit.singh@mic.edu',
    password: 'employee123',
    role: 'employee',
    department: 'Computer Science & Engineering (CSE)',
    designation: 'Assistant Professor',
    qualification: 'M.Tech in Computer Science & Engineering, B.Tech CSE',
    mobileNo: '9876543212',
    dateOfBirth: '1990-07-10',
    dateOfJoining: '2021-03-15'
  },
  {
    name: 'Dr. Sneha Patel',
    email: 'sneha.patel@mic.edu',
    password: 'employee123',
    role: 'employee',
    department: 'Artificial Intelligence Data Science & Machine Learning (AIDS & ML)',
    designation: 'Associate Professor',
    qualification: 'Ph.D. in Artificial Intelligence, M.Tech AI & ML, B.Tech CSE',
    mobileNo: '9876543214',
    dateOfBirth: '1992-11-25',
    dateOfJoining: '2022-01-10'
  },
  {
    name: 'Prof. Vikram Joshi',
    email: 'vikram.joshi@mic.edu',
    password: 'employee123',
    role: 'employee',
    department: 'Electronics & Communication Engineering (ECE)',
    designation: 'Assistant Professor',
    qualification: 'M.Tech in Electronics & Communication Engineering, B.E. ECE',
    mobileNo: '9876543215',
    dateOfBirth: '1988-05-12',
    dateOfJoining: '2019-08-20'
  },
  {
    name: 'Dr. Arun Gupta',
    email: 'arun.gupta@mic.edu',
    password: 'employee123',
    role: 'employee',
    department: 'Mechanical Engineering (MECH)',
    designation: 'Associate Professor',
    qualification: 'Ph.D. in Mechanical Engineering, M.Tech Mechanical, B.E. Mech',
    mobileNo: '9876543216',
    dateOfBirth: '1985-04-18',
    dateOfJoining: '2018-12-01'
  },
  {
    name: 'Prof. Kavita Sharma',
    email: 'kavita.sharma@mic.edu',
    password: 'employee123',
    role: 'employee',
    department: 'Information Technology & Master of Computer Applications (IT & MCA)',
    designation: 'Assistant Professor',
    qualification: 'M.Tech in Information Technology, MCA, B.Tech IT',
    mobileNo: '9876543217',
    dateOfBirth: '1991-08-22',
    dateOfJoining: '2020-07-15'
  },
  {
    name: 'Dr. Meera Nair',
    email: 'meera.nair@mic.edu',
    password: 'employee123',
    role: 'employee',
    department: 'Bachelor of Education (BED)',
    designation: 'Assistant Professor',
    qualification: 'M.Ed., B.Ed., M.A. Education',
    mobileNo: '9876543218',
    dateOfBirth: '1987-12-03',
    dateOfJoining: '2020-09-10'
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Generate unique employeeIds for each user
    const year = new Date().getFullYear();
    for (let i = 0; i < users.length; i++) {
      users[i].employeeId = `MIC${year}${String(i + 1).padStart(4, '0')}`;
    }

    // Create new users
    const createdUsers = await User.create(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Display created users
    createdUsers.forEach(user => {
      console.log(`👤 ${user.name} (${user.role}) - ${user.email} - ID: ${user.employeeId}`);
    });

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@mic.edu / admin123');
    console.log('HOD CSE: hod.cse@mic.edu / hod123');
    console.log('HOD ECE: hod.ece@mic.edu / hod123');
    console.log('Prof. Amit (CSE): amit.singh@mic.edu / employee123');
    console.log('Dr. Sneha (AI/ML): sneha.patel@mic.edu / employee123');
    console.log('Prof. Vikram (ECE): vikram.joshi@mic.edu / employee123');
    console.log('Dr. Arun (Mech): arun.gupta@mic.edu / employee123');
    console.log('Prof. Kavita (IT/MCA): kavita.sharma@mic.edu / employee123');
    console.log('Dr. Meera (BED): meera.nair@mic.edu / employee123');
    console.log('Dr. Sunita (IT): sunita.agarwal@mic.edu / employee123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seed function
seedDatabase();