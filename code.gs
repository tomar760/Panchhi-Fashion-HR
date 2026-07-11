/* ============================================================
   HOUSE OF PANCHHI HR SOFTWARE v2.0
   code.gs — Complete Google Apps Script Backend
   
   Sheet ID:     14J8wS97gRrJp4o67ww8-9aQIIiS5KYpPdKHevH4wzSc
   Drive Folder: 1X3S9CuUv3JDhzv9u6jIS70-XLnk4mSSv
   Web App URL:  https://script.google.com/macros/s/AKfycbxNL8Au4HugjloU0t7EC5U3RNdFLXF3A5PdB4hIDhw1yqQKksvurFoP9rV9zzzGRm7vYw/exec

   SETUP STEPS:
   1. Extensions → Apps Script → Replace all code with this file
   2. Run setupSheets() once manually (Run → Run function → setupSheets)
   3. Deploy → New Deployment → Web App
      Execute as: Me  |  Who has access: Anyone
   4. Copy the /exec URL → paste in app.js WEB_APP_URL
============================================================ */

const CONFIG = {
  SHEET_ID        : '14J8wS97gRrJp4o67ww8-9aQIIiS5KYpPdKHevH4wzSc',
  DRIVE_FOLDER_ID : '1X3S9CuUv3JDhzv9u6jIS70-XLnk4mSSv',
  TIMEZONE        : 'Asia/Kolkata',
};

const SHEETS = {
  EMPLOYEES   : 'Employees',
  ATTENDANCE  : 'Attendance',
  GATE_PASS   : 'Gate Pass',
  LEAVE       : 'Leave Records',
  SALARY      : 'Salary Register',
  ADVANCE     : 'Advance & Loans',
  STORE       : 'Store Entries',
  USERS       : 'Users',
  DEPARTMENTS : 'Departments',
  ACTIVITY    : 'Activity Log',
  SETTINGS    : 'Settings',
};

/* ════════════════════════════════════════════════════════════
   CORS + ENTRY POINTS
════════════════════════════════════════════════════════════ */

function setCORS(output) {
  return output
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function doOptions() {
  return setCORS(ContentService.createTextOutput('OK'));
}

function doPost(e) {
  try {
    let action, data;
    if (e.postData && e.postData.type === 'application/json') {
      const body = JSON.parse(e.postData.contents);
      action = body.action;
      data   = body.data || {};
    } else {
      action = e.parameter.action || '';
      data   = JSON.parse(e.parameter.data || '{}');
    }
    const result = routePost(action, data);
    return setCORS(
      ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
    );
  } catch (err) {
    return setCORS(
      ContentService.createTextOutput(JSON.stringify({
        success: false, error: err.message
      })).setMimeType(ContentService.MimeType.JSON)
    );
  }
}

function doGet(e) {
  try {
    const sheet  = e.parameter.sheet  || '';
    const filter = e.parameter.filter || '';
    const limit  = parseInt(e.parameter.limit || '0');
    const result = routeGet(sheet, filter, limit);
    return setCORS(
      ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
    );
  } catch (err) {
    return setCORS(
      ContentService.createTextOutput(JSON.stringify({
        success: false, error: err.message
      })).setMimeType(ContentService.MimeType.JSON)
    );
  }
}

/* ════════════════════════════════════════════════════════════
   POST ROUTER
════════════════════════════════════════════════════════════ */

function routePost(action, data) {
  switch (action) {
    // Auth
    case 'Auth_Login'         : return loginUser(data);
    case 'User_Save'          : return saveUser(data);
    case 'User_Delete'        : return deleteUser(data);

    // Employees
    case 'Employee_Save'      : return saveEmployee(data);
    case 'Employee_Delete'    : return deleteEmployee(data);
    case 'Employee_BulkSave'  : return bulkSaveEmployees(data);

    // Attendance
    case 'Attendance_BulkSave'    : return bulkSaveAttendance(data);
    case 'Attendance_UpdateRemark' : return updateAttRemark(data);

    // Gate Pass
    case 'GatePass_Issue'  : return issueGatePass(data);
    case 'GatePass_Return' : return returnGatePass(data);

    // Leave
    case 'Leave_Submit'  : return submitLeave(data);
    case 'Leave_Approve' : return approveLeave(data);
    case 'Leave_Reject'  : return rejectLeave(data);
    case 'Leave_AdjustBalance' : return adjustLeaveBalance(data);

    // Salary & Advance
    case 'Salary_BulkSave' : return bulkSaveSalary(data);
    case 'Advance_Save'    : return saveAdvance(data);
    case 'Advance_Update'  : return updateAdvance(data);
    case 'Advance_Clear'   : return clearAdvance(data);

    // Store
    case 'Store_Save'     : return saveStore(data);
    case 'Store_UpdatePO' : return updateStorePO(data);
    case 'Store_Delete'   : return deleteStore(data);
    case 'Store_Upload'   : return uploadStoreFile(data);

    // Departments & Settings
    case 'Department_Save' : return saveDepartment(data);
    case 'Settings_Save'   : return saveSettings(data);

    // Activity
    case 'Activity_Log' : return logActivity(data);

    default:
      return { success: false, error: 'Unknown action: ' + action };
  }
}

/* ════════════════════════════════════════════════════════════
   GET ROUTER
════════════════════════════════════════════════════════════ */

function routeGet(sheet, filter, limit) {
  switch (sheet) {
    case 'Dashboard'    : return getDashboardStats();
    case 'Employees'    : return readEmployees(filter);
    case 'Attendance'   : return readAttendance(filter);
    case 'GatePass'     : return readGatePass(filter);
    case 'Leave'        : return readLeave(filter);
    case 'Salary'       : return readSalary(filter);
    case 'Advance'      : return readAdvance(filter);
    case 'Store'        : return readStore(filter);
    case 'Users'        : return readUsers();
    case 'Departments'  : return readDepartments();
    case 'Settings'     : return readSettings();
    case 'Activity'     : return readActivity(limit || 30);
    default:
      return { success: false, error: 'Unknown sheet: ' + sheet };
  }
}

/* ════════════════════════════════════════════════════════════
   AUTH & USERS
════════════════════════════════════════════════════════════ */

function loginUser(data) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USERS);
  if (!sheet) return { success: false, error: 'Users not configured. Run setupSheets().' };

  const users = sheetToObjects(sheet);
  const user  = users.find(u =>
    u.Username && u.Username.toString().toLowerCase() === (data.username||'').toLowerCase() &&
    u.Password === data.password &&
    u.Active   === 'YES'
  );

  if (!user) return { success: false, error: 'Invalid username or password' };

  return {
    success : true,
    user    : {
      id       : user.ID       || '',
      username : user.Username || '',
      name     : user.Name     || '',
      role     : user.Role     || 'HR_EXEC',
      email    : user.Email    || '',
    }
  };
}

function saveUser(data) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = getOrCreate(ss, SHEETS.USERS);
  ensureHeaders(sheet, ['ID','Username','Password','Name','Role','Email','Active','CreatedAt']);

  const now = fmtDate();
  const row = [
    data.id       || genId('USR'),
    data.username || '',
    data.password || '',
    data.name     || '',
    data.role     || 'HR_EXEC',
    data.email    || '',
    data.active !== false ? 'YES' : 'NO',
    data.createdAt || now,
  ];

  const existing = findByCol(sheet, 2, data.username);
  if (existing > 0) sheet.getRange(existing, 1, 1, row.length).setValues([row]);
  else sheet.appendRow(row);
  alternateRows(sheet);
  return { success: true };
}

function deleteUser(data) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USERS);
  if (!sheet) return { success: false };
  const row = findByCol(sheet, 2, data.username);
  if (row > 0) sheet.getRange(row, colIdx(sheet,'Active')).setValue('NO');
  return { success: true };
}

function readUsers() {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USERS);
  if (!sheet) return { success: true, data: [] };
  return {
    success : true,
    data    : sheetToObjects(sheet)
      .filter(r => r.Active === 'YES')
      .map(r => ({
        id       : r.ID       || '',
        username : r.Username || '',
        name     : r.Name     || '',
        role     : r.Role     || '',
        email    : r.Email    || '',
      }))
  };
}

/* ════════════════════════════════════════════════════════════
   EMPLOYEES
════════════════════════════════════════════════════════════ */

const EMP_HEADERS = [
  'ID','ECode','OldCode','FullName','FirstName','FatherName','LastName',
  'DOB','Gender','Marital','Department','Designation','Location',
  'JoiningDate','ConfirmDate',
  'ShiftType','ShiftStart','ShiftEnd',
  'Status','TagSenior','TagBonus',
  'Mobile','AltMobile','Email','OfficialEmail',
  'CurrentAddress','CurrentPIN','PermanentAddress','PermanentPIN',
  'EmgName','EmgRelation','EmgPhone',
  'Aadhar','PAN',
  'FixCTC','NewCTC','PayMode','Bank','BankHolder','AccountNo','IFSC','Branch',
  'PLBalance','SLBalance','PLUsed','SLUsed','LWPUsed',
  'ProfilePhotoURL','Remark','AddedOn','UpdatedAt',
];

function saveEmployee(data) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = getOrCreate(ss, SHEETS.EMPLOYEES);
  ensureHeaders(sheet, EMP_HEADERS);

  const now  = fmtDate();
  // Handle old shift string "10:00-19:00" format for backward compat
  let shiftStart = data.shiftStart || '';
  let shiftEnd   = data.shiftEnd   || '';
  if (!shiftStart && data.shift) {
    const parts = data.shift.split('-');
    shiftStart  = parts[0] ? parts[0].trim() : '10:00';
    shiftEnd    = parts[1] ? parts[1].trim() : '19:00';
  }

  const row = [
    data.id          || genId('EMP'),
    (data.ecode      || '').toUpperCase().trim(),
    data.oldcode     || '',
    (data.fullname   || '').toUpperCase().trim(),
    data.fname       || '',
    data.fhname      || '',
    data.lname       || '',
    data.dob         || '',
    data.gender      || '',
    data.marital     || '',
    (data.department || '').toUpperCase().trim(),
    (data.designation|| '').toUpperCase().trim(),
    data.location    || '',
    data.joining     || '',
    data.confirm     || '',
    data.shiftType   || 'CUSTOM',
    shiftStart       || '10:00',
    shiftEnd         || '19:00',
    data.status      || 'ACTIVE',
    data.tagSenior   ? 'YES' : 'NO',
    data.tagBonus    ? 'YES' : 'NO',
    data.mobile      || '',
    data.altmobile   || '',
    data.email       || '',
    data.offemail    || '',
    data.curraddr    || '',
    data.currpin     || '',
    data.permaddr    || '',
    data.permpin     || '',
    data.emgname     || '',
    data.emgrelation || '',
    data.emgphone    || '',
    data.aadhar      || '',
    data.pan         || '',
    parseFloat(data.fixctc)  || 0,
    parseFloat(data.newctc)  || 0,
    data.paymode     || '',
    data.bank        || '',
    data.bankname    || '',
    data.accno       || '',
    data.ifsc        || '',
    data.branch      || '',
    data.plBalance   !== undefined ? parseFloat(data.plBalance) : 12,
    data.slBalance   !== undefined ? parseFloat(data.slBalance) : 3,
    parseFloat(data.plUsed)  || 0,
    parseFloat(data.slUsed)  || 0,
    parseFloat(data.lwpUsed) || 0,
    data.profilePhoto || data.profilePhotoURL || '',
    data.remark      || '',
    data.addedOn     || now,
    now,
  ];

  const existing = findByCol(sheet, 2, data.ecode);
  if (existing > 0) sheet.getRange(existing, 1, 1, row.length).setValues([row]);
  else             sheet.appendRow(row);
  alternateRows(sheet);
  logActivity({ module:'Employees', action: existing>0?'UPDATE':'INSERT', details: data.ecode });
  return { success: true, id: row[0], ecode: row[1] };
}

function deleteEmployee(data) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.EMPLOYEES);
  if (!sheet) return { success: false };
  const row = findByCol(sheet, 2, data.ecode);
  if (row > 0) sheet.getRange(row, colIdx(sheet,'Status')).setValue('DELETED');
  return { success: true };
}

function bulkSaveEmployees(dataArr) {
  if (!Array.isArray(dataArr)) return { success: false, error: 'Array expected' };
  let count = 0;
  dataArr.forEach(emp => { saveEmployee(emp); count++; });
  return { success: true, count };
}

function readEmployees(filter) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.EMPLOYEES);
  if (!sheet) return { success: true, data: [] };
  let rows = sheetToObjects(sheet).filter(r => r.Status !== 'DELETED');
  if (filter) {
    const [k, v] = filter.split(':');
    if (k && v) rows = rows.filter(r => (r[k]||'').toLowerCase() === v.toLowerCase());
  }
  return { success: true, data: rows.map(mapEmp) };
}

function mapEmp(r) {
  const shiftStart = r.ShiftStart || '10:00';
  const shiftEnd   = r.ShiftEnd   || '19:00';
  return {
    id            : r.ID            || '',
    ecode         : r.ECode         || '',
    oldcode       : r.OldCode       || '',
    fullname      : r.FullName      || '',
    fname         : r.FirstName     || '',
    fhname        : r.FatherName    || '',
    lname         : r.LastName      || '',
    dob           : r.DOB           || '',
    gender        : r.Gender        || '',
    marital       : r.Marital       || '',
    department    : r.Department    || '',
    designation   : r.Designation  || '',
    location      : r.Location      || '',
    joining       : r.JoiningDate   || '',
    confirm       : r.ConfirmDate   || '',
    shiftType     : r.ShiftType     || 'CUSTOM',
    shiftStart    : shiftStart,
    shiftEnd      : shiftEnd,
    shift         : shiftStart + '-' + shiftEnd,
    status        : r.Status        || 'ACTIVE',
    tagSenior     : r.TagSenior     === 'YES',
    tagBonus      : r.TagBonus      === 'YES',
    mobile        : r.Mobile        || '',
    altmobile     : r.AltMobile     || '',
    email         : r.Email         || '',
    offemail      : r.OfficialEmail || '',
    curraddr      : r.CurrentAddress|| '',
    currpin       : r.CurrentPIN    || '',
    permaddr      : r.PermanentAddress||'',
    permpin       : r.PermanentPIN  || '',
    emgname       : r.EmgName       || '',
    emgrelation   : r.EmgRelation   || '',
    emgphone      : r.EmgPhone      || '',
    aadhar        : r.Aadhar        || '',
    pan           : r.PAN           || '',
    fixctc        : parseFloat(r.FixCTC) || 0,
    newctc        : parseFloat(r.NewCTC) || 0,
    paymode       : r.PayMode       || '',
    bank          : r.Bank          || '',
    bankname      : r.BankHolder    || '',
    accno         : r.AccountNo     || '',
    ifsc          : r.IFSC          || '',
    branch        : r.Branch        || '',
    plBalance     : parseFloat(r.PLBalance) || 12,
    slBalance     : parseFloat(r.SLBalance) || 3,
    plUsed        : parseFloat(r.PLUsed)    || 0,
    slUsed        : parseFloat(r.SLUsed)    || 0,
    lwpUsed       : parseFloat(r.LWPUsed)   || 0,
    profilePhoto  : r.ProfilePhotoURL       || '',
    remark        : r.Remark        || '',
    addedOn       : r.AddedOn       || '',
  };
}

/* ════════════════════════════════════════════════════════════
   ATTENDANCE
════════════════════════════════════════════════════════════ */

function bulkSaveAttendance(dataArr) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = getOrCreate(ss, SHEETS.ATTENDANCE);
  ensureHeaders(sheet, [
    'ID','Date','ECode','EmpName','Department',
    'ShiftStart','ShiftEnd','InTime','LateMinutes',
    'Status','ExcelStatus','Remark','SavedAt',
  ]);

  const records = Array.isArray(dataArr) ? dataArr : [dataArr];
  const now     = fmtDateFull();

  records.forEach(r => {
    const row = [
      r.id          || genId('ATT'),
      r.date        || '',
      r.ecode       || '',
      r.empName     || '',
      r.department  || '',
      r.shiftStart  || r.shift ? (r.shift||'').split('-')[0] : '10:00',
      r.shiftEnd    || r.shift ? (r.shift||'').split('-')[1] : '19:00',
      r.inTime      || '',
      parseFloat(r.lateMin) || 0,
      r.status      || '',
      r.excelStatus || '',
      r.remark      || '',
      now,
    ];
    const ex = findByMulti(sheet, [{col:2,val:r.date},{col:3,val:r.ecode}]);
    if (ex > 0) sheet.getRange(ex, 1, 1, row.length).setValues([row]);
    else        sheet.appendRow(row);
  });
  alternateRows(sheet);
  return { success: true, count: records.length };
}

function updateAttRemark(data) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.ATTENDANCE);
  if (!sheet) return { success: false };
  const row = findByMulti(sheet, [{col:2,val:data.date},{col:3,val:data.ecode}]);
  if (row > 0) sheet.getRange(row, colIdx(sheet,'Remark')).setValue(data.remark||'');
  return { success: true };
}

function readAttendance(filter) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.ATTENDANCE);
  if (!sheet) return { success: true, data: [] };
  let rows = sheetToObjects(sheet);
  if (filter) {
    if      (filter.startsWith('date:' )) rows = rows.filter(r => r.Date  === filter.slice(5));
    else if (filter.startsWith('month:')) rows = rows.filter(r => (r.Date||'').startsWith(filter.slice(6)));
    else if (filter.startsWith('ecode:')) rows = rows.filter(r => r.ECode === filter.slice(6));
  }
  return {
    success : true,
    data    : rows.map(r => ({
      id          : r.ID           || '',
      date        : r.Date         || '',
      ecode       : r.ECode        || '',
      empName     : r.EmpName      || '',
      department  : r.Department   || '',
      shiftStart  : r.ShiftStart   || '10:00',
      shiftEnd    : r.ShiftEnd     || '19:00',
      shift       : (r.ShiftStart||'10:00') + '-' + (r.ShiftEnd||'19:00'),
      inTime      : r.InTime       || '',
      lateMin     : parseFloat(r.LateMinutes) || 0,
      status      : r.Status       || '',
      excelStatus : r.ExcelStatus  || '',
      remark      : r.Remark       || '',
    }))
  };
}

/* ════════════════════════════════════════════════════════════
   GATE PASS
════════════════════════════════════════════════════════════ */

function issueGatePass(data) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = getOrCreate(ss, SHEETS.GATE_PASS);
  ensureHeaders(sheet, [
    'ID','Date','ECode','EmpName','Department','Mobile',
    'ShiftStart','ShiftEnd','OutTime','ReturnTime','ExpectedReturn',
    'Purpose','EarlyMinutes','DurationMinutes','Status','CreatedAt',
  ]);

  const id  = data.id || genId('GP');
  const row = [
    id,
    data.date            || '',
    data.ecode           || '',
    data.empName         || '',
    data.department      || '',
    data.mobile          || '',
    data.shiftStart      || '10:00',
    data.shiftEnd        || '19:00',
    data.outTime         || '',
    data.returnTime      || '',
    data.expectedReturn  || '',
    data.purpose         || '',
    parseFloat(data.earlyMinutes)    || 0,
    parseFloat(data.durationMinutes) || 0,
    data.status          || 'OUT',
    fmtDateFull(),
  ];

  const ex = findByCol(sheet, 1, id);
  if (ex > 0) sheet.getRange(ex, 1, 1, row.length).setValues([row]);
  else        sheet.appendRow(row);
  alternateRows(sheet);
  return { success: true, id };
}

function returnGatePass(data) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.GATE_PASS);
  if (!sheet) return { success: false };
  const row = findByCol(sheet, 1, data.id);
  if (row > 0) {
    sheet.getRange(row, colIdx(sheet,'ReturnTime'))     .setValue(data.returnTime      || '');
    sheet.getRange(row, colIdx(sheet,'DurationMinutes')).setValue(data.durationMinutes || 0);
    sheet.getRange(row, colIdx(sheet,'Status'))         .setValue('RETURNED');
  }
  return { success: true };
}

function readGatePass(filter) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.GATE_PASS);
  if (!sheet) return { success: true, data: [] };
  let rows = sheetToObjects(sheet);
  if (filter) {
    if      (filter.startsWith('date:' )) rows = rows.filter(r => r.Date === filter.slice(5));
    else if (filter.startsWith('month:')) rows = rows.filter(r => (r.Date||'').startsWith(filter.slice(6)));
    else if (filter.startsWith('ecode:')) rows = rows.filter(r => r.ECode === filter.slice(6));
  }
  return {
    success : true,
    data    : rows.map(r => ({
      id             : r.ID              || '',
      date           : r.Date            || '',
      ecode          : r.ECode           || '',
      empName        : r.EmpName         || '',
      department     : r.Department      || '',
      mobile         : r.Mobile          || '',
      shiftStart     : r.ShiftStart      || '10:00',
      shiftEnd       : r.ShiftEnd        || '19:00',
      shift          : (r.ShiftStart||'10:00') + '-' + (r.ShiftEnd||'19:00'),
      outTime        : r.OutTime         || '',
      returnTime     : r.ReturnTime      || null,
      expectedReturn : r.ExpectedReturn  || '',
      purpose        : r.Purpose         || '',
      earlyMinutes   : parseFloat(r.EarlyMinutes)    || 0,
      durationMinutes: parseFloat(r.DurationMinutes) || 0,
      status         : r.Status          || 'OUT',
    }))
  };
}

/* ════════════════════════════════════════════════════════════
   LEAVE
════════════════════════════════════════════════════════════ */

function submitLeave(data) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = getOrCreate(ss, SHEETS.LEAVE);
  ensureHeaders(sheet, [
    'ID','AppliedOn','ECode','EmpName','Department',
    'Type','FromDate','ToDate','Days','Reason',
    'MedCert','MedVerified','Status','ApprovedOn','RejectedOn',
  ]);

  const id  = data.id || genId('LV');
  const row = [
    id,
    data.appliedOn   || fmtDate(),
    data.ecode       || '',
    data.empName     || '',
    data.department  || '',
    data.type        || '',
    data.from        || '',
    data.to          || '',
    parseFloat(data.days) || 0,
    data.reason      || '',
    data.medCert     || '',
    data.medVerified ? 'YES' : 'NO',
    data.status      || 'PENDING',
    data.approvedOn  || '',
    data.rejectedOn  || '',
  ];

  const ex = findByCol(sheet, 1, id);
  if (ex > 0) sheet.getRange(ex, 1, 1, row.length).setValues([row]);
  else        sheet.appendRow(row);
  alternateRows(sheet);
  return { success: true, id };
}

function approveLeave(data) {
  const ss      = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const lvSheet = ss.getSheetByName(SHEETS.LEAVE);
  if (!lvSheet) return { success: false };

  const row = findByCol(lvSheet, 1, data.id);
  if (row < 1) return { success: false, error: 'Leave not found' };

  lvSheet.getRange(row, colIdx(lvSheet,'Status'))    .setValue('APPROVED');
  lvSheet.getRange(row, colIdx(lvSheet,'ApprovedOn')).setValue(data.approvedOn || fmtDate());
  lvSheet.getRange(row, 1, 1, lvSheet.getLastColumn()).setBackground('#d1fae5');

  // Update employee balance
  const lvObjs = sheetToObjects(lvSheet);
  const lvRec  = lvObjs.find(r => r.ID === data.id);
  if (lvRec) {
    const empSheet = ss.getSheetByName(SHEETS.EMPLOYEES);
    if (empSheet) {
      const empRow = findByCol(empSheet, 2, lvRec.ECode);
      if (empRow > 0) {
        const days = parseFloat(lvRec.Days) || 0;
        if (lvRec.Type === 'PL') {
          const cur = parseFloat(empSheet.getRange(empRow, colIdx(empSheet,'PLBalance')).getValue()) || 0;
          empSheet.getRange(empRow, colIdx(empSheet,'PLBalance')).setValue(Math.max(0, cur - days));
          const used = parseFloat(empSheet.getRange(empRow, colIdx(empSheet,'PLUsed')).getValue()) || 0;
          empSheet.getRange(empRow, colIdx(empSheet,'PLUsed')).setValue(used + days);
        } else if (lvRec.Type === 'SL') {
          const cur = parseFloat(empSheet.getRange(empRow, colIdx(empSheet,'SLBalance')).getValue()) || 0;
          empSheet.getRange(empRow, colIdx(empSheet,'SLBalance')).setValue(Math.max(0, cur - days));
          const used = parseFloat(empSheet.getRange(empRow, colIdx(empSheet,'SLUsed')).getValue()) || 0;
          empSheet.getRange(empRow, colIdx(empSheet,'SLUsed')).setValue(used + days);
        } else if (lvRec.Type === 'LWP') {
          const cur = parseFloat(empSheet.getRange(empRow, colIdx(empSheet,'LWPUsed')).getValue()) || 0;
          empSheet.getRange(empRow, colIdx(empSheet,'LWPUsed')).setValue(cur + days);
        }
      }
    }
  }
  return { success: true };
}

function rejectLeave(data) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.LEAVE);
  if (!sheet) return { success: false };
  const row = findByCol(sheet, 1, data.id);
  if (row > 0) {
    sheet.getRange(row, colIdx(sheet,'Status'))    .setValue('REJECTED');
    sheet.getRange(row, colIdx(sheet,'RejectedOn')).setValue(data.rejectedOn || fmtDate());
    sheet.getRange(row, 1, 1, sheet.getLastColumn()).setBackground('#fee2e2');
  }
  return { success: true };
}

function adjustLeaveBalance(data) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.EMPLOYEES);
  if (!sheet) return { success: false };
  const row = findByCol(sheet, 2, data.ecode);
  if (row < 1) return { success: false, error: 'Employee not found' };
  if (data.plBalance  !== undefined) sheet.getRange(row, colIdx(sheet,'PLBalance')).setValue(parseFloat(data.plBalance)  || 0);
  if (data.slBalance  !== undefined) sheet.getRange(row, colIdx(sheet,'SLBalance')).setValue(parseFloat(data.slBalance)  || 0);
  if (data.plUsed     !== undefined) sheet.getRange(row, colIdx(sheet,'PLUsed'))   .setValue(parseFloat(data.plUsed)     || 0);
  if (data.lwpUsed    !== undefined) sheet.getRange(row, colIdx(sheet,'LWPUsed'))  .setValue(parseFloat(data.lwpUsed)    || 0);
  return { success: true };
}

function readLeave(filter) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.LEAVE);
  if (!sheet) return { success: true, data: [] };
  let rows = sheetToObjects(sheet);
  if (filter) {
    if      (filter.startsWith('status:')) rows = rows.filter(r => r.Status === filter.slice(7));
    else if (filter.startsWith('ecode:' )) rows = rows.filter(r => r.ECode  === filter.slice(6));
    else if (filter.startsWith('month:' )) rows = rows.filter(r => (r.FromDate||'').startsWith(filter.slice(6)));
  }
  return {
    success : true,
    data    : rows.map(r => ({
      id          : r.ID          || '',
      appliedOn   : r.AppliedOn   || '',
      ecode       : r.ECode       || '',
      empName     : r.EmpName     || '',
      department  : r.Department  || '',
      type        : r.Type        || '',
      from        : r.FromDate    || '',
      to          : r.ToDate      || '',
      days        : parseFloat(r.Days) || 0,
      reason      : r.Reason      || '',
      medCert     : r.MedCert     || '',
      medVerified : r.MedVerified === 'YES',
      status      : r.Status      || 'PENDING',
      approvedOn  : r.ApprovedOn  || '',
      rejectedOn  : r.RejectedOn  || '',
    }))
  };
}

/* ════════════════════════════════════════════════════════════
   SALARY & ADVANCE
════════════════════════════════════════════════════════════ */

function bulkSaveSalary(dataArr) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = getOrCreate(ss, SHEETS.SALARY);
  ensureHeaders(sheet, [
    'ID','Month','ECode','EmpName','Department','BankAcc',
    'GrossCTC','WorkingDays','PresentDays','PayableDays','BonusDays',
    'GrossEarned','AdvanceDed','LoanEMI','LWPDed','TotalDed','NetSalary',
    'TagBonus','TagSenior','CalculatedAt',
  ]);

  const records = Array.isArray(dataArr) ? dataArr : [dataArr];
  const now     = fmtDateFull();

  records.forEach(r => {
    const row = [
      r.id || genId('SAL'), r.month||'', r.ecode||'', r.empName||'',
      r.department||'', r.bankAcc||'',
      r.gross||0, r.workingDays||26, r.presentDays||0,
      r.payableDays||0, r.bonusDays||0,
      r.grossEarned||0, r.advanceDeduction||0, r.loanEMI||0,
      r.lwpDeduction||0, r.totalDeductions||0, r.netSalary||0,
      r.tagBonus  ? 'YES' : 'NO',
      r.tagSenior ? 'YES' : 'NO',
      now,
    ];
    const ex = findByMulti(sheet, [{col:2,val:r.month},{col:3,val:r.ecode}]);
    if (ex > 0) sheet.getRange(ex, 1, 1, row.length).setValues([row]);
    else        sheet.appendRow(row);
  });
  alternateRows(sheet);
  return { success: true, count: records.length };
}

function saveAdvance(data) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = getOrCreate(ss, SHEETS.ADVANCE);
  ensureHeaders(sheet, [
    'ID','GivenOn','ECode','EmpName','Department',
    'Type','Amount','EMI','Balance','DeductMonth','EMIStartMonth',
    'Remark','Status','ClearedOn',
  ]);

  const id  = data.id || genId('ADV');
  const row = [
    id,
    data.givenOn       || fmtDate(),
    data.ecode         || '',
    data.empName       || '',
    data.department    || '',
    data.type          || 'ADVANCE',
    parseFloat(data.amount)  || 0,
    parseFloat(data.emi)     || 0,
    parseFloat(data.balance) || 0,
    data.deductMonth   || '',
    data.emiStartMonth || '',
    data.remark        || '',
    data.status        || 'ACTIVE',
    data.clearedOn     || '',
  ];

  const ex = findByCol(sheet, 1, id);
  if (ex > 0) sheet.getRange(ex, 1, 1, row.length).setValues([row]);
  else        sheet.appendRow(row);
  alternateRows(sheet);
  return { success: true, id };
}

function updateAdvance(data) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.ADVANCE);
  if (!sheet) return { success: false };
  const row = findByCol(sheet, 1, data.id);
  if (row > 0) {
    if (data.balance !== undefined) sheet.getRange(row, colIdx(sheet,'Balance')).setValue(parseFloat(data.balance) || 0);
    if (data.status  !== undefined) sheet.getRange(row, colIdx(sheet,'Status')) .setValue(data.status);
  }
  return { success: true };
}

function clearAdvance(data) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.ADVANCE);
  if (!sheet) return { success: false };
  const row = findByCol(sheet, 1, data.id);
  if (row > 0) {
    sheet.getRange(row, colIdx(sheet,'Status'))   .setValue('CLEARED');
    sheet.getRange(row, colIdx(sheet,'Balance'))  .setValue(0);
    sheet.getRange(row, colIdx(sheet,'ClearedOn')).setValue(fmtDate());
  }
  return { success: true };
}

function readSalary(filter) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.SALARY);
  if (!sheet) return { success: true, data: [] };
  let rows = sheetToObjects(sheet);
  if (filter && filter.startsWith('month:')) rows = rows.filter(r => r.Month === filter.slice(6));
  return {
    success : true,
    data    : rows.map(r => ({
      id               : r.ID         || '',
      month            : r.Month      || '',
      ecode            : r.ECode      || '',
      empName          : r.EmpName    || '',
      department       : r.Department || '',
      bankAcc          : r.BankAcc    || '',
      gross            : parseFloat(r.GrossCTC)    || 0,
      workingDays      : parseFloat(r.WorkingDays) || 26,
      presentDays      : parseFloat(r.PresentDays) || 0,
      payableDays      : parseFloat(r.PayableDays) || 0,
      bonusDays        : parseFloat(r.BonusDays)   || 0,
      grossEarned      : parseFloat(r.GrossEarned) || 0,
      advanceDeduction : parseFloat(r.AdvanceDed)  || 0,
      loanEMI          : parseFloat(r.LoanEMI)     || 0,
      lwpDeduction     : parseFloat(r.LWPDed)      || 0,
      totalDeductions  : parseFloat(r.TotalDed)    || 0,
      netSalary        : parseFloat(r.NetSalary)   || 0,
      tagBonus         : r.TagBonus  === 'YES',
      tagSenior        : r.TagSenior === 'YES',
    }))
  };
}

function readAdvance(filter) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.ADVANCE);
  if (!sheet) return { success: true, data: [] };
  let rows = sheetToObjects(sheet);
  if (filter && filter.startsWith('status:')) rows = rows.filter(r => r.Status === filter.slice(7));
  if (filter && filter.startsWith('ecode:' )) rows = rows.filter(r => r.ECode  === filter.slice(6));
  return {
    success : true,
    data    : rows.map(r => ({
      id            : r.ID           || '',
      givenOn       : r.GivenOn      || '',
      ecode         : r.ECode        || '',
      empName       : r.EmpName      || '',
      department    : r.Department   || '',
      type          : r.Type         || '',
      amount        : parseFloat(r.Amount)   || 0,
      emi           : parseFloat(r.EMI)      || 0,
      balance       : parseFloat(r.Balance)  || 0,
      deductMonth   : r.DeductMonth  || '',
      emiStartMonth : r.EMIStartMonth|| '',
      remark        : r.Remark       || '',
      status        : r.Status       || 'ACTIVE',
    }))
  };
}

/* ════════════════════════════════════════════════════════════
   STORE & GOOGLE DRIVE
════════════════════════════════════════════════════════════ */

function saveStore(data) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = getOrCreate(ss, SHEETS.STORE);
  ensureHeaders(sheet, [
    'ID','Date','ItemName','Category','Condition','Qty','Unit',
    'Rate','Total','Vendor','PONumber','PRNumber','BillNumber',
    'AttachmentURL','AttachmentName','POStatus','Remark','AddedAt',
  ]);

  const id  = data.id || genId('ST');
  const row = [
    id,
    data.date          || fmtDate(),
    data.itemName      || '',
    data.category      || '',
    data.condition     || 'NEW',
    parseFloat(data.qty)   || 0,
    data.unit          || '',
    parseFloat(data.rate)  || 0,
    parseFloat(data.total) || 0,
    data.vendor        || '',
    data.po            || '',
    data.pr            || '',
    data.bill          || '',
    data.attachmentUrl || data.attachmentURL || '',
    data.attachmentName|| '',
    (data.po && data.pr) ? 'COMPLETE' : 'PENDING',
    data.remark        || '',
    fmtDateFull(),
  ];

  const ex = findByCol(sheet, 1, id);
  if (ex > 0) sheet.getRange(ex, 1, 1, row.length).setValues([row]);
  else        sheet.appendRow(row);
  alternateRows(sheet);
  return { success: true, id };
}

function updateStorePO(data) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.STORE);
  if (!sheet) return { success: false };
  const row = findByCol(sheet, 1, data.id);
  if (row > 0) {
    sheet.getRange(row, colIdx(sheet,'PONumber'))  .setValue(data.po   || '');
    sheet.getRange(row, colIdx(sheet,'PRNumber'))  .setValue(data.pr   || '');
    sheet.getRange(row, colIdx(sheet,'BillNumber')).setValue(data.bill || '');
    const status = (data.po && data.pr) ? 'COMPLETE' : 'PENDING';
    sheet.getRange(row, colIdx(sheet,'POStatus')).setValue(status);
    if (status === 'COMPLETE') sheet.getRange(row, 1, 1, sheet.getLastColumn()).setBackground('#d1fae5');
  }
  return { success: true };
}

function deleteStore(data) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.STORE);
  if (!sheet) return { success: false };
  const row = findByCol(sheet, 1, data.id);
  if (row > 0) sheet.deleteRow(row);
  return { success: true };
}

function uploadStoreFile(data) {
  try {
    const result = uploadToDrive(data.base64, data.fileName, data.mimeType, 'Store Attachments');
    return { success: true, ...result };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function readStore(filter) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.STORE);
  if (!sheet) return { success: true, data: [] };
  let rows = sheetToObjects(sheet);
  if (filter && filter.startsWith('status:')) rows = rows.filter(r => r.POStatus === filter.slice(7));
  if (filter && filter.startsWith('date:')  ) rows = rows.filter(r => r.Date     === filter.slice(5));
  return {
    success : true,
    data    : rows.map(r => ({
      id             : r.ID             || '',
      date           : r.Date           || '',
      itemName       : r.ItemName       || '',
      category       : r.Category       || '',
      condition      : r.Condition      || 'NEW',
      qty            : parseFloat(r.Qty)   || 0,
      unit           : r.Unit           || '',
      rate           : parseFloat(r.Rate)  || 0,
      total          : parseFloat(r.Total) || 0,
      vendor         : r.Vendor         || '',
      po             : r.PONumber        || '',
      pr             : r.PRNumber        || '',
      bill           : r.BillNumber      || '',
      attachmentUrl  : r.AttachmentURL   || '',
      attachmentName : r.AttachmentName  || '',
      poStatus       : r.POStatus        || 'PENDING',
      remark         : r.Remark          || '',
      addedAt        : r.AddedAt         || '',
    }))
  };
}

/* ─── Google Drive Upload ─── */

function uploadToDrive(base64, fileName, mimeType, subFolderName) {
  const root = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);

  // Get or create subfolder
  let folder;
  const iter = root.getFoldersByName(subFolderName);
  folder     = iter.hasNext() ? iter.next() : root.createFolder(subFolderName);

  // Decode and upload
  const clean = base64.replace(/^data:[^;]+;base64,/, '');
  const blob  = Utilities.newBlob(Utilities.base64Decode(clean), mimeType || 'application/octet-stream', fileName);
  const file  = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    fileId   : file.getId(),
    fileUrl  : 'https://drive.google.com/file/d/' + file.getId() + '/view',
    fileName : fileName,
    viewUrl  : 'https://drive.google.com/uc?id=' + file.getId(),
  };
}

/* ════════════════════════════════════════════════════════════
   DEPARTMENTS  (31-Day Bonus by Dept)
════════════════════════════════════════════════════════════ */

function saveDepartment(data) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = getOrCreate(ss, SHEETS.DEPARTMENTS);
  ensureHeaders(sheet, ['Name','TagBonus','DefaultShiftStart','DefaultShiftEnd','WorkingDays','UpdatedAt']);

  const row = [
    (data.name||'').toUpperCase().trim(),
    data.tagBonus ? 'YES' : 'NO',
    data.defaultShiftStart || '10:00',
    data.defaultShiftEnd   || '19:00',
    parseFloat(data.workingDays) || 26,
    fmtDate(),
  ];

  const ex = findByCol(sheet, 1, row[0]);
  if (ex > 0) sheet.getRange(ex, 1, 1, row.length).setValues([row]);
  else        sheet.appendRow(row);
  alternateRows(sheet);
  return { success: true };
}

function readDepartments() {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.DEPARTMENTS);
  if (!sheet) return { success: true, data: [] };
  return {
    success : true,
    data    : sheetToObjects(sheet).map(r => ({
      name              : r.Name              || '',
      tagBonus          : r.TagBonus          === 'YES',
      defaultShiftStart : r.DefaultShiftStart || '10:00',
      defaultShiftEnd   : r.DefaultShiftEnd   || '19:00',
      workingDays       : parseFloat(r.WorkingDays) || 26,
    }))
  };
}

/* ════════════════════════════════════════════════════════════
   SETTINGS
════════════════════════════════════════════════════════════ */

function saveSettings(data) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = getOrCreate(ss, SHEETS.SETTINGS);
  ensureHeaders(sheet, ['Key','Value','UpdatedAt']);
  Object.entries(data).forEach(([k, v]) => {
    const row = [k, v.toString(), fmtDateFull()];
    const ex  = findByCol(sheet, 1, k);
    if (ex > 0) sheet.getRange(ex, 1, 1, row.length).setValues([row]);
    else        sheet.appendRow(row);
  });
  return { success: true };
}

function readSettings() {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.SETTINGS);
  if (!sheet) return { success: true, data: {} };
  const obj = {};
  sheetToObjects(sheet).forEach(r => { if (r.Key) obj[r.Key] = r.Value; });
  return { success: true, data: obj };
}

/* ════════════════════════════════════════════════════════════
   ACTIVITY LOG
════════════════════════════════════════════════════════════ */

function logActivity(data) {
  try {
    const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = getOrCreate(ss, SHEETS.ACTIVITY);
    ensureHeaders(sheet, ['ID','Timestamp','Module','Action','Details']);
    sheet.appendRow([genId('LOG'), fmtDateFull(), data.module||'', data.action||'', data.details||'']);
  } catch(e) { /* silent fail */ }
  return { success: true };
}

function readActivity(limit) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.ACTIVITY);
  if (!sheet) return { success: true, data: [] };
  const rows = sheetToObjects(sheet).reverse().slice(0, limit || 30);
  return {
    success : true,
    data    : rows.map(r => ({
      id        : r.ID        || '',
      timestamp : r.Timestamp || '',
      module    : r.Module    || '',
      action    : r.Action    || '',
      details   : r.Details   || '',
    }))
  };
}

/* ════════════════════════════════════════════════════════════
   DASHBOARD STATS  (single optimized call)
════════════════════════════════════════════════════════════ */

function getDashboardStats() {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const today = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const month = today.slice(0, 7);

  // Employees
  const empSheet = ss.getSheetByName(SHEETS.EMPLOYEES);
  let totalEmp = 0, activeEmp = 0, inactiveEmp = 0, deptSet = new Set(), birthdays = [];
  if (empSheet && empSheet.getLastRow() > 1) {
    const emps = sheetToObjects(empSheet).filter(r => r.Status !== 'DELETED');
    totalEmp   = emps.length;
    activeEmp  = emps.filter(e => e.Status === 'ACTIVE').length;
    inactiveEmp= emps.filter(e => e.Status === 'INACTIVE').length;
    emps.forEach(e => { if (e.Department) deptSet.add(e.Department); });
    // Birthdays today
    const todayMD = today.slice(5);
    emps.filter(e => e.Status === 'ACTIVE' && e.DOB && e.DOB.toString().slice(5) === todayMD)
      .forEach(e => birthdays.push({ name: e.FullName, dept: e.Department, ecode: e.ECode }));
  }

  // Attendance today
  const attSheet = ss.getSheetByName(SHEETS.ATTENDANCE);
  let presentToday = 0, absentToday = 0, lateToday = 0;
  if (attSheet && attSheet.getLastRow() > 1) {
    const todayRecs = sheetToObjects(attSheet).filter(r => r.Date === today);
    presentToday = todayRecs.filter(r => r.Status === 'P' || r.Status === 'L').length;
    absentToday  = todayRecs.filter(r => r.Status === 'A').length;
    lateToday    = todayRecs.filter(r => r.Status === 'L').length;
  }

  // Gate Pass now outside
  const gpSheet = ss.getSheetByName(SHEETS.GATE_PASS);
  let onGatePass = 0;
  if (gpSheet && gpSheet.getLastRow() > 1) {
    onGatePass = sheetToObjects(gpSheet).filter(r => r.Date === today && r.Status === 'OUT').length;
  }

  // Pending leaves
  const lvSheet = ss.getSheetByName(SHEETS.LEAVE);
  let pendingLeaves = 0;
  if (lvSheet && lvSheet.getLastRow() > 1) {
    pendingLeaves = sheetToObjects(lvSheet).filter(r => r.Status === 'PENDING').length;
  }

  // Payroll this month
  const salSheet = ss.getSheetByName(SHEETS.SALARY);
  let netPayroll = 0;
  if (salSheet && salSheet.getLastRow() > 1) {
    salSheet && sheetToObjects(salSheet).filter(r => r.Month === month)
      .forEach(r => { netPayroll += parseFloat(r.NetSalary) || 0; });
  }

  // Pending PO/PR in store
  const storeSheet = ss.getSheetByName(SHEETS.STORE);
  let pendingPO = 0;
  if (storeSheet && storeSheet.getLastRow() > 1) {
    pendingPO = sheetToObjects(storeSheet).filter(r => r.POStatus === 'PENDING').length;
  }

  // Probation ending in 7 days
  const probationSoon = [];
  if (empSheet && empSheet.getLastRow() > 1) {
    const nowMs = new Date().getTime();
    sheetToObjects(empSheet).filter(e => e.Status==='ACTIVE' && e.ConfirmDate).forEach(e => {
      const diff = Math.round((new Date(e.ConfirmDate).getTime() - nowMs) / 86400000);
      if (diff >= 0 && diff <= 7) {
        probationSoon.push({ name: e.FullName, dept: e.Department, date: e.ConfirmDate, daysLeft: diff });
      }
    });
  }

  return {
    success : true,
    data    : {
      today, month,
      totalEmp, activeEmp, inactiveEmp,
      totalDepts   : deptSet.size,
      presentToday, absentToday, lateToday,
      onGatePass, pendingLeaves, netPayroll,
      pendingPO, birthdays, probationSoon,
    }
  };
}

/* ════════════════════════════════════════════════════════════
   HELPER FUNCTIONS
════════════════════════════════════════════════════════════ */

function getOrCreate(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function ensureHeaders(sheet, headers) {
  if (sheet.getLastRow() > 0) return; // Already has headers
  sheet.appendRow(headers);
  styleHeader(sheet);
}

function getHeaders(sheet) {
  if (sheet.getLastRow() === 0) return [];
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => h.toString().trim());
}

function colIdx(sheet, headerName) {
  return getHeaders(sheet).indexOf(headerName) + 1;
}

function sheetToObjects(sheet) {
  if (sheet.getLastRow() < 2) return [];
  const headers = getHeaders(sheet);
  const rows    = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  return rows
    .filter(row => row.some(v => v !== '' && v !== null && v !== undefined))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] !== undefined ? row[i].toString().trim() : ''; });
      return obj;
    });
}

function findByCol(sheet, col, value) {
  const last = sheet.getLastRow();
  if (last < 2) return -1;
  const vals = sheet.getRange(2, col, last - 1, 1).getValues();
  for (let i = 0; i < vals.length; i++) {
    if (vals[i][0]?.toString().trim() === value?.toString().trim()) return i + 2;
  }
  return -1;
}

function findByMulti(sheet, conditions) {
  const last   = sheet.getLastRow();
  if (last < 2) return -1;
  const maxCol = Math.max(...conditions.map(c => c.col));
  const vals   = sheet.getRange(2, 1, last - 1, maxCol).getValues();
  for (let i = 0; i < vals.length; i++) {
    if (conditions.every(c => vals[i][c.col - 1]?.toString().trim() === c.val?.toString().trim())) return i + 2;
  }
  return -1;
}

function styleHeader(sheet) {
  const last = sheet.getLastColumn();
  if (last === 0) return;
  const range = sheet.getRange(1, 1, 1, last);
  range.setBackground('#9d174d');
  range.setFontColor('#ffffff');
  range.setFontWeight('bold');
  range.setFontSize(10);
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 36);
  try { for (let i = 1; i <= last; i++) sheet.setColumnWidth(i, 130); } catch (e) {}
}

function alternateRows(sheet) {
  const last    = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (last < 2 || lastCol === 0) return;
  for (let i = 2; i <= last; i++) {
    sheet.getRange(i, 1, 1, lastCol).setBackground(i % 2 === 0 ? '#fdf2f8' : '#ffffff');
  }
}

function genId(prefix) {
  return (prefix || '') + Date.now().toString(36).toUpperCase() +
    Math.random().toString(36).slice(2, 5).toUpperCase();
}

function fmtDate() {
  return Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
}
function fmtDateFull() {
  return Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'dd/MM/yyyy HH:mm:ss');
}

/* ════════════════════════════════════════════════════════════
   SETUP — Run Once Manually Before First Deploy
════════════════════════════════════════════════════════════ */

function setupSheets() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);

  // Create all sheets
  Object.values(SHEETS).forEach(name => {
    if (!ss.getSheetByName(name)) {
      ss.insertSheet(name);
      Logger.log('✅ Created sheet: ' + name);
    }
  });

  // Remove default Sheet1 if present
  const def = ss.getSheetByName('Sheet1');
  if (def && ss.getSheets().length > 1) {
    ss.deleteSheet(def);
    Logger.log('🗑️  Removed Sheet1');
  }

  // Create default admin user
  saveUser({
    id       : 'USR_ADMIN_001',
    username : 'admin',
    password : 'Admin@2116',
    name     : 'Aditya Tomar',
    role     : 'SUPER_ADMIN',
    email    : 'admin@houseofpanchhi.com',
    active   : true,
    createdAt: fmtDate(),
  });
  Logger.log('👤 Default admin user created: admin / Admin@2116');

  // Save default settings
  saveSettings({
    companyName    : 'House of Panchhi',
    defaultWorkDays: '26',
    defaultShiftStart: '10:00',
    defaultShiftEnd  : '19:00',
    plPerYear      : '12',
    slPerYear      : '3',
    maxAdvancePct  : '50',
    graceHours     : '3',
  });
  Logger.log('⚙️  Default settings saved');

  // Create Drive subfolders
  try {
    const root = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    ['Profile Photos', 'Medical Certificates', 'Store Attachments', 'Salary Slips', 'MIS Imports']
      .forEach(name => {
        if (!root.getFoldersByName(name).hasNext()) {
          root.createFolder(name);
          Logger.log('📁 Drive folder created: ' + name);
        }
      });
  } catch (e) {
    Logger.log('⚠️  Drive folder error: ' + e.message + ' — Check DRIVE_FOLDER_ID');
  }

  Logger.log('\n🎉 Setup complete! Now: Deploy → New Deployment → Web App → Copy URL');
}

/* Quick test — run this after deploy to verify connection */
function testConnection() {
  const result = getDashboardStats();
  Logger.log('Dashboard test: ' + JSON.stringify(result));
}
