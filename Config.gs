function getDbId() {
  try {
    var ss = getActiveSpreadsheet();
    if(ss) return ss.getId();
  } catch(e) {}
  
  return null;
}

const CONFIG = {
  APP_NAME: 'SI-MENGAJAR GURU'
};