import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import Truck from '../models/Truck.js';
import Driver from '../models/Driver.js';
import Drive from '../models/Drive.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const createSampleActivities = async () => {
  try {
    // Get admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin user found. Please create an admin user first.');
      return;
    }

    // Get some trucks and drivers
    const trucks = await Truck.find().limit(3);
    const drivers = await Driver.find().limit(3);
    const journeys = await Drive.find().limit(3);

    if (trucks.length === 0 || drivers.length === 0) {
      console.log('No trucks or drivers found. Please create some first.');
      return;
    }

    console.log(`Found ${trucks.length} trucks, ${drivers.length} drivers, ${journeys.length} journeys`);

    // Create sample activities
    const activities = [
      {
        type: 'journey_started',
        title: 'Journey Started',
        description: `Journey to ${journeys[0]?.destination || 'Kigali'} started by ${drivers[0]?.name || 'John Doe'}`,
        details: {
          customer: journeys[0]?.customer || 'Sample Customer',
          destination: journeys[0]?.destination || 'Kigali',
          origin: journeys[0]?.origin || 'Kampala',
          status: 'started',
          totalAmount: journeys[0]?.pay?.totalAmount || 50000
        },
        journeyId: journeys[0]?._id,
        truckId: trucks[0]?._id,
        driverId: drivers[0]?._id,
        performedBy: admin._id,
        metadata: {
          action: 'started',
          journeyStatus: 'started'
        },
        activityTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        type: 'payment_received',
        title: 'Payment Received',
        description: `Full payment of $${(journeys[0]?.pay?.totalAmount || 50000).toLocaleString()} received for journey to ${journeys[0]?.destination || 'Kigali'}`,
        details: {
          amount: journeys[0]?.pay?.totalAmount || 50000,
          paymentMethod: 'cash',
          journeyDestination: journeys[0]?.destination || 'Kigali',
          customer: journeys[0]?.customer || 'Sample Customer',
          remainingBalance: 0
        },
        journeyId: journeys[0]?._id,
        truckId: trucks[0]?._id,
        driverId: drivers[0]?._id,
        performedBy: admin._id,
        metadata: {
          paymentType: 'payment_received',
          amount: journeys[0]?.pay?.totalAmount || 50000
        },
        activityTimestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      },
      {
        type: 'truck_added',
        title: 'Truck Added',
        description: `Truck ${trucks[0]?.plateNumber || 'TRK-001'} (${trucks[0]?.model || 'Isuzu'}) added to the fleet`,
        details: {
          plateNumber: trucks[0]?.plateNumber || 'TRK-001',
          model: trucks[0]?.model || 'Isuzu',
          year: trucks[0]?.year || 2020,
          status: trucks[0]?.status || 'active',
          capacity: trucks[0]?.capacity || 10
        },
        truckId: trucks[0]?._id,
        performedBy: admin._id,
        metadata: {
          action: 'added',
          truckStatus: trucks[0]?.status || 'active'
        },
        activityTimestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      },
      {
        type: 'driver_added',
        title: 'Driver Added',
        description: `Driver ${drivers[0]?.name || 'John Doe'} added to the system`,
        details: {
          name: drivers[0]?.name || 'John Doe',
          phone: drivers[0]?.phone || '+250123456789',
          licenseNumber: drivers[0]?.licenseNumber || 'DL123456',
          status: drivers[0]?.status || 'active',
          experience: drivers[0]?.experience || 5
        },
        driverId: drivers[0]?._id,
        performedBy: admin._id,
        metadata: {
          action: 'added',
          driverStatus: drivers[0]?.status || 'active'
        },
        activityTimestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      {
        type: 'journey_completed',
        title: 'Journey Completed',
        description: `Journey to ${journeys[1]?.destination || 'Mombasa'} completed by ${drivers[1]?.name || 'Jane Smith'}`,
        details: {
          customer: journeys[1]?.customer || 'Sample Customer 2',
          destination: journeys[1]?.destination || 'Mombasa',
          origin: journeys[1]?.origin || 'Kampala',
          status: 'completed',
          totalAmount: journeys[1]?.pay?.totalAmount || 75000
        },
        journeyId: journeys[1]?._id,
        truckId: trucks[1]?._id,
        driverId: drivers[1]?._id,
        performedBy: admin._id,
        metadata: {
          action: 'completed',
          journeyStatus: 'completed'
        },
        activityTimestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
      }
    ];

    // Insert activities
    const createdActivities = await Activity.insertMany(activities);
    console.log(`Created ${createdActivities.length} sample activities`);

    // Display created activities
    console.log('\nCreated Activities:');
    createdActivities.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.title} - ${activity.formattedTimestamp}`);
    });

  } catch (error) {
    console.error('Error creating sample activities:', error);
  }
};

const main = async () => {
  await connectDB();
  await createSampleActivities();
  await mongoose.disconnect();
  console.log('\nSample activities creation completed!');
};

main().catch(console.error);

