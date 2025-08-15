const express = require("express");
const router = express.Router();
const ExcelJS = require("exceljs");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

// Generate Excel template for employee data
router.get("/template", 
  // Add debug middleware
  (req, res, next) => {
    console.log('Headers:', req.headers);
    console.log('Authorization:', req.headers.authorization);
    next();
  },
  protect, 
  authorize(["admin"]), 
  async (req, res) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Employees");

      // Define columns based on format provided
      worksheet.columns = [
        { header: "Employee ID", key: "employeeId", width: 20 },
        { header: "Name*", key: "name", width: 25 },
        { header: "Email*", key: "email", width: 30 },
        { header: "Role*", key: "role", width: 15 },
        { header: "Department*", key: "department", width: 25 },
        { header: "Designation*", key: "designation", width: 20 },
        { header: "Qualification*", key: "qualification", width: 20 },
        { header: "Mobile Number*", key: "mobileNo", width: 15 },
        { header: "Date of Birth*", key: "dateOfBirth", width: 20 },
        { header: "Date of Joining", key: "dateOfJoining", width: 20 }
      ];

      // Style the header
      worksheet.getRow(1).font = { bold: true };

      // Add note about required fields
      worksheet.addRow([
        "Optional",
        "* Required",
        "* Required",
        "* admin, hod, or employee",
        "* Required",
        "* Required",
        "* Required",
        "* 10 digits",
        "* DD-MM-YYYY format",
        "DD-MM-YYYY format (optional)"
      ]);
      
      // Add sample data
      worksheet.addRow([
        "MIC20250001", // Employee ID (can be auto-generated if not provided)
        "John Doe",
        "john.doe@mic.edu",
        "employee",
        "Computer Science & Engineering (CSE)",
        "Assistant Professor",
        "M.Tech",
        "9876543210",
        "15-01-1990",
        "01-06-2022"
      ]);

      // Set the content type and headers for file download
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=employee-template.xlsx"
      );

      // Write the workbook to the response
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Error generating template:", error);
      res.status(500).json({ error: "Error generating template" });
    }
  }
);

// Function to process a worksheet
const processWorksheet = async (worksheet, req, res) => {
  if (!worksheet) {
    return res.status(400).json({ 
      errors: [{ msg: "Invalid Excel file: no worksheet found" }] 
    });
  }

  const errors = [];
  const successful = [];
  let rowCount = 0;

  // Array to store all user creation promises
  const userPromises = [];

  try {
    worksheet.eachRow((row, rowNumber) => {
      // Skip the header row and any note rows
      if (rowNumber <= 2) return;
      
      try {
        console.log(`Processing row ${rowNumber} with data:`, row.values);
        rowCount++;
        
        // Based on the provided Excel format:
        // Employee ID | Name | Email | Role | Department | Designation | Qualification | Mobile Number | Date of Birth | Date of Joining
        
        // Handle email (can be an object with text property or a simple string)
        let emailValue = row.getCell(3).value;
        if (emailValue && typeof emailValue === 'object' && emailValue.text) {
          emailValue = emailValue.text;
        }
        
        const rowData = {
          employeeId: row.getCell(1).value,
          name: row.getCell(2).value,
          email: emailValue,
          role: row.getCell(4).value,
          department: row.getCell(5).value,
          designation: row.getCell(6).value,
          qualification: row.getCell(7).value,
          mobileNo: row.getCell(8).value,
          dateOfBirth: row.getCell(9).value,
          dateOfJoining: row.getCell(10).value,
          // Generate a default password using email
          password: emailValue ? emailValue.split('@')[0] + '123' : ''
        };

        // Validate required fields
        const validationErrors = [];
        if (!rowData.name) validationErrors.push("Name is required");
        if (!rowData.email) validationErrors.push("Email is required");
        if (!rowData.department) validationErrors.push("Department is required");
        if (!rowData.role) validationErrors.push("Role is required");
        if (!rowData.designation) validationErrors.push("Designation is required");
        if (!rowData.qualification) validationErrors.push("Qualification is required");
        if (!rowData.mobileNo) validationErrors.push("Mobile number is required");
        if (!rowData.dateOfBirth) validationErrors.push("Date of birth is required");
        
        // Password is auto-generated, so no validation needed
        
        // Validate role
        if (rowData.role && !["admin", "hod", "employee"].includes(String(rowData.role).toLowerCase())) {
          validationErrors.push("Role must be 'admin', 'hod', or 'employee'");
        }
        
        // Validate mobile number - remove any non-digits and check length
        if (rowData.mobileNo) {
          const cleanMobileNo = String(rowData.mobileNo).replace(/\D/g, '');
          if (cleanMobileNo.length !== 10) {
            validationErrors.push("Mobile number must be 10 digits");
          }
          // Update to cleaned version
          rowData.mobileNo = cleanMobileNo;
        }
        
        // Handle date format conversion
        if (rowData.dateOfBirth) {
          try {
            // If it's already a Date object, leave it as is
            if (rowData.dateOfBirth instanceof Date) {
              console.log(`Row ${rowNumber}: Date of Birth is already a Date object:`, rowData.dateOfBirth);
              // No conversion needed
            } else if (typeof rowData.dateOfBirth === 'string') {
              // Try different formats
              console.log(`Row ${rowNumber}: Converting Date of Birth string:`, rowData.dateOfBirth);
              let dateParts;
              if (rowData.dateOfBirth.includes('-')) {
                dateParts = rowData.dateOfBirth.split('-');
                if (dateParts.length === 3) {
                  // Format: DD-MM-YYYY
                  if (dateParts[2].length === 4) {
                    rowData.dateOfBirth = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                  } else {
                    throw new Error("Invalid date format");
                  }
                }
              } else if (rowData.dateOfBirth.includes('.')) {
                dateParts = rowData.dateOfBirth.split('.');
                if (dateParts.length === 3) {
                  // Format: DD.MM.YY
                  if (dateParts[2].length === 2) {
                    const year = 2000 + parseInt(dateParts[2]);
                    rowData.dateOfBirth = new Date(year, dateParts[1] - 1, dateParts[0]);
                  } else {
                    rowData.dateOfBirth = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                  }
                }
              }
            } else if (typeof rowData.dateOfBirth === 'number') {
              // Excel numeric date (days since 1900-01-01)
              console.log(`Row ${rowNumber}: Converting Excel numeric date:`, rowData.dateOfBirth);
              // Convert Excel serial date to JS Date
              rowData.dateOfBirth = new Date((rowData.dateOfBirth - 25569) * 86400 * 1000);
            }
            
            // Validate date is valid
            if (isNaN(rowData.dateOfBirth)) {
              validationErrors.push("Date of Birth is invalid");
            }
          } catch (e) {
            console.error(`Row ${rowNumber}: Error parsing Date of Birth:`, e);
            validationErrors.push("Date of Birth format is invalid");
          }
        }
        
        // Handle date of joining format conversion
        if (rowData.dateOfJoining) {
          try {
            // If it's already a Date object, leave it as is
            if (rowData.dateOfJoining instanceof Date) {
              console.log(`Row ${rowNumber}: Date of Joining is already a Date object:`, rowData.dateOfJoining);
              // No conversion needed
            } else if (typeof rowData.dateOfJoining === 'string') {
              console.log(`Row ${rowNumber}: Converting Date of Joining string:`, rowData.dateOfJoining);
              let dateParts;
              if (rowData.dateOfJoining.includes('.')) {
                dateParts = rowData.dateOfJoining.split('.');
                if (dateParts.length === 3) {
                  // Format: DD.MM.YY
                  if (dateParts[2].length === 2) {
                    const year = 2000 + parseInt(dateParts[2]);
                    rowData.dateOfJoining = new Date(year, dateParts[1] - 1, dateParts[0]);
                  } else {
                    rowData.dateOfJoining = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                  }
                }
              } else if (rowData.dateOfJoining.includes('-')) {
                dateParts = rowData.dateOfJoining.split('-');
                if (dateParts.length === 3) {
                  // Format: DD-MM-YYYY
                  rowData.dateOfJoining = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                }
              }
            } else if (typeof rowData.dateOfJoining === 'number') {
              // Excel numeric date
              console.log(`Row ${rowNumber}: Converting Excel numeric date:`, rowData.dateOfJoining);
              // Convert Excel serial date to JS Date
              rowData.dateOfJoining = new Date((rowData.dateOfJoining - 25569) * 86400 * 1000);
            }
            
            // Validate date is valid
            if (isNaN(rowData.dateOfJoining)) {
              validationErrors.push("Date of Joining is invalid");
            }
          } catch (e) {
            console.error(`Row ${rowNumber}: Error parsing Date of Joining:`, e);
            validationErrors.push("Date of Joining format is invalid");
          }
        }

        if (validationErrors.length > 0) {
          errors.push({
            row: rowNumber,
            errors: validationErrors
          });
          return;
        }

        // Create a promise for user creation and add to the array
        const userPromise = (async () => {
          try {
            // Check if email already exists
            const existingUser = await User.findOne({ email: rowData.email });
            if (existingUser) {
              errors.push({
                row: rowNumber,
                errors: ["Email already exists"]
              });
              return;
            }

            // Check if employee ID already exists (if provided)
            if (rowData.employeeId) {
              const existingEmployeeId = await User.findOne({ employeeId: rowData.employeeId });
              if (existingEmployeeId) {
                errors.push({
                  row: rowNumber,
                  errors: ["Employee ID already exists"]
                });
                return;
              }
            }

            // Create new user object (password will be hashed by the User model's pre-save hook)
            const userData = {
              name: rowData.name,
              email: rowData.email,
              department: rowData.department,
              role: String(rowData.role).toLowerCase(),
              designation: rowData.designation,
              qualification: rowData.qualification,
              mobileNo: String(rowData.mobileNo),
              dateOfBirth: rowData.dateOfBirth, // Already converted to Date object
              password: rowData.password
            };
            
            // Add optional fields if provided
            if (rowData.employeeId) {
              userData.employeeId = String(rowData.employeeId);
            }
            
            if (rowData.dateOfJoining) {
              userData.dateOfJoining = rowData.dateOfJoining; // Already converted to Date object
            }

            // Log user data for debugging
            console.log(`Creating user at row ${rowNumber}:`, {
              ...userData,
              password: '[REDACTED]',
              dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.toISOString() : null,
              dateOfJoining: userData.dateOfJoining ? userData.dateOfJoining.toISOString() : null
            });

            // Create and save user
            const newUser = new User(userData);

            await newUser.save();
            console.log(`User created successfully for row ${rowNumber}`);
            successful.push(rowNumber);
          } catch (error) {
            console.error(`Error creating user at row ${rowNumber}:`, error);
            errors.push({
              row: rowNumber,
              errors: [error.message || "Error creating user"]
            });
          }
        })();
        
        userPromises.push(userPromise);
      } catch (rowError) {
        console.error(`Error processing row ${rowNumber}:`, rowError);
        errors.push({
          row: rowNumber,
          errors: [rowError.message || "Error processing row"]
        });
      }
    });

    // Wait for all user creation operations to complete
    await Promise.all(userPromises);
    
    if (errors.length > 0) {
      return res.status(400).json({
        message: `Processed ${rowCount} rows with ${errors.length} errors`,
        errors: errors,
        successful: successful.length
      });
    }
    
    const processingEndTime = new Date();
    const processingTime = (processingEndTime - req.processingStartTime) / 1000;
    console.log(`Excel upload completed successfully in ${processingTime} seconds`);
    
    return res.json({
      message: `Successfully imported ${successful.length} employees`,
      successful: successful.length,
      processingTime: `${processingTime.toFixed(2)} seconds`
    });
  } catch (worksheetError) {
    console.error('Error processing worksheet:', worksheetError);
    return res.status(500).json({ 
      errors: [{ msg: "Error processing worksheet", details: worksheetError.message }] 
    });
  }
};

// Upload and process Excel file
router.post(
  "/upload",
  // Add debug middleware
  (req, res, next) => {
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Upload Headers:', req.headers);
    console.log('Upload Authorization:', req.headers.authorization);
    // Add timestamp for tracking processing time
    req.processingStartTime = new Date();
    console.log('Starting Excel upload processing at:', req.processingStartTime.toISOString());
    next();
  },
  protect,
  authorize(["admin"]),
  async (req, res) => {
    try {
      console.log("Processing Excel upload from user:", req.user?.email, "with role:", req.user?.role);
      
      const { fileData, fileName } = req.body;
      
      console.log('File name received:', fileName);
      console.log('File data length:', fileData ? fileData.length : 'No file data');
      
      if (!fileData || !fileName) {
        return res.status(400).json({ errors: [{ msg: "No file data provided" }] });
      }
      
      // Convert base64 to buffer
      const buffer = Buffer.from(fileData, 'base64');
      
      try {
        console.log('Attempting to load Excel buffer of size:', buffer.length);
        const workbook = new ExcelJS.Workbook();
        
        try {
          await workbook.xlsx.load(buffer);
          console.log('Workbook loaded successfully');
        } catch (loadError) {
          console.error('Error loading workbook:', loadError);
          return res.status(400).json({ 
            errors: [{ msg: "Could not parse Excel file data", details: loadError.message }] 
          });
        }
        
        const worksheet = workbook.getWorksheet(1);
        console.log('Worksheet found:', !!worksheet, worksheet ? `with ${worksheet.rowCount} rows` : '');
        
        // For debugging - show all worksheets
        console.log('Available worksheets:', workbook.worksheets.map(ws => ws.name));
        
        // Try to find the first worksheet if worksheet 1 is not found
        if (!worksheet && workbook.worksheets.length > 0) {
          console.log('Using first available worksheet instead of worksheet 1');
          const firstWorksheet = workbook.worksheets[0];
          console.log('First worksheet name:', firstWorksheet.name, 'with rows:', firstWorksheet.rowCount);
          return processWorksheet(firstWorksheet, req, res);
        }
        
        // Process the worksheet
        return processWorksheet(worksheet, req, res);
        
      } catch (error) {
        console.error("Error processing Excel file:", error);
        return res.status(500).json({ 
          errors: [{ msg: "Error processing Excel file", details: error.message }] 
        });
      }
    } catch (outerError) {
      console.error("Error in upload route:", outerError);
      return res.status(500).json({
        errors: [{ msg: "Server error during file upload", details: outerError.message }]
      });
    }
  }
);

module.exports = router;
