import axios from 'axios';

const ApiService = axios.create({
  baseURL: 'https://dashboard.shrotitele.com/apitpms/tpiamsApi/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (login_id, password) => {
  try {
    const response = await ApiService.post('loginTwo', { login_id, password });
    return response?.data;
  } catch (error) {
    throw error;
  }
};

export const updateLocation = async (user, latitude, longitude) => {
  try {
    const response = await ApiService.post('update_location', {
      user,
      latitude,
      longitude,
    });

    return response?.data;
  } catch (error) {
    console.error('Update Location Error:', error?.response || error);
    throw error;
  }
};

export const savePermissionLog = async logData => {
  try {
    const response = await ApiService.post('save_permission_log', logData);
    return response?.data;
  } catch (error) {
    throw error;
  }
};

export const siteStatus = async (
  login_id,
  aidv4,
  ctm_idv4,
  usertypev4,
  client_versionv4,
  state_id,
  dist_id,
  cluster_id,
  aidv1,
  emp_typev1,
  usertypev1,
  aidv2,
  ctm_idv2,
  emp_typev2,
  usertypev2,
  client_versionv2,
  client_type_name,
) => {
  try {
    const response = await ApiService.post(
      'new_find_site_status_dashboard_count',
      {
        login_id,
        aidv4,
        ctm_idv4,
        usertypev4,
        client_versionv4,
        state_id,
        dist_id,
        cluster_id,
        aidv1,
        emp_typev1,
        usertypev1,
        aidv2,
        ctm_idv2,
        emp_typev2,
        usertypev2,
        client_versionv2,
        client_type_name,
      },
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const realTimealarm = async (
  login_id,
  aidv4,
  usertypev4,
  aidv1,
  usertypev1,
  ctmidv1,
  ctmidv4,
  state,
  district,
  cluster,
  page = 1,
  limit = 10,
  statusFilter = 'all',
  search_filter = '',
) => {
  try {
    const response = await ApiService.post('realTimeAlarm', {
      login_id,
      aidv4,
      usertypev4,
      aidv1,
      usertypev1,
      ctmidv1,
      ctmidv4,
      state,
      district,
      cluster,
      page,
      limit,
      status_filter: statusFilter,
      search_filter: search_filter,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};

export const alarmList = async (
  login_id,
  aidv4,
  ctm_idv4,
  usertypev4,
  client_versionv4,
  state_id,
  dist_id,
  cluster_id,
  alarm_type,
  aidv1,
  usertypev1,
  aidv2,
  usertypev2,
  ctm_idv1,
  ctm_idv2,
) => {
  try {
    const response = await ApiService.post('new_getAlarmList', {
      login_id,
      aidv4,
      ctm_idv4,
      usertypev4,
      client_versionv4,
      state_id,
      dist_id,
      cluster_id,
      alarm_type,
      aidv1,
      usertypev1,
      aidv2,
      usertypev2,
      ctm_idv1,
      ctm_idv2,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};

export const getDataByAlarmId = async (
  login_id,
  aid,
  usertype,
  state_id,
  dist_id,
  client_version,
  ctm_id,
  cluster_id,
  alarm_type,
  alarm_id,
  active_imei,
  active_ports,
) => {
  try {
    const response = await ApiService.post('getDataByAlarmId', {
      login_id,
      aid,
      usertype,
      state_id,
      dist_id,
      client_version,
      ctm_id,
      cluster_id,
      alarm_type,
      alarm_id,
      active_imei,
      active_ports,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};

export const new_getDataByAlarmId = async (imei, alarm_id, date) => {
  try {
    const response = await ApiService.post('new_getDataByAlarmId', {
      imei,
      alarm_id,
      date,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};

export const siteStatusList = async (
  login_id,
  aidv4,
  ctm_idv4,
  usertypev4,
  client_versionv4,
  state_id,
  dist_id,
  cluster_id,
  limit,
  offset,
  status,
  aidv1,
  emp_typev1,
  usertypev1,
  aidv2,
  emp_typev2,
  usertypev2,
) => {
  try {
    const response = await ApiService.post('new_find_site_status_list', {
      login_id,
      aidv4,
      ctm_idv4,
      usertypev4,
      client_versionv4,
      state_id,
      dist_id,
      cluster_id,
      limit,
      offset,
      status,
      aidv1,
      emp_typev1,
      usertypev1,
      aidv2,
      emp_typev2,
      usertypev2,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};

export const getClients = async () => {
  try {
    const response = await ApiService.post('new_getClient', {});
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const getAlarm = async () => {
  try {
    const response = await ApiService.post('getAlarm', {});
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const getStateList = async (ctmidv4, ctmidv2, ctmidv1) => {
  try {
    const response = await ApiService.post('new_getStateList', {
      ctmidv4,
      ctmidv2,
      ctmidv1,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const getStateListClient = async (
  aidv4,
  aidv2,
  aidv1,
  usertypev4,
  usertypev2,
  usertypev1,
  ctmidv4,
  ctmidv2,
  ctmidv1,
) => {
  try {
    const response = await ApiService.post('new_getStateListClient', {
      aidv4,
      aidv2,
      aidv1,
      usertypev4,
      usertypev2,
      usertypev1,
      ctmidv4,
      ctmidv2,
      ctmidv1,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const getDistrictList = async (ctmidv4, ctmidv2, ctmidv1, state_id) => {
  try {
    const response = await ApiService.post('new_getDistrictList', {
      ctmidv4,
      ctmidv2,
      ctmidv1,
      state_id,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const getDistrictListClient = async (
  aidv4,
  aidv2,
  aidv1,
  usertypev4,
  usertypev2,
  usertypev1,
  ctmidv4,
  ctmidv2,
  ctmidv1,
  state_id,
) => {
  try {
    const response = await ApiService.post('new_getDistrictListClient', {
      aidv4,
      aidv2,
      aidv1,
      usertypev4,
      usertypev2,
      usertypev1,
      ctmidv4,
      ctmidv2,
      ctmidv1,
      state_id,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const getClusterList = async (ctmidv4, ctmidv2, ctmidv1, dist_id) => {
  try {
    const response = await ApiService.post('new_getClusterList', {
      ctmidv4,
      ctmidv2,
      ctmidv1,
      dist_id,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const getClusterListClient = async (
  aidv4,
  aidv2,
  aidv1,
  usertypev4,
  usertypev2,
  usertypev1,
  ctmidv4,
  ctmidv2,
  ctmidv1,
  dist_id,
) => {
  try {
    const response = await ApiService.post('new_getClusterListClient', {
      aidv4,
      aidv2,
      aidv1,
      usertypev4,
      usertypev2,
      usertypev1,
      ctmidv4,
      ctmidv2,
      ctmidv1,
      dist_id,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const getSiteDetail = async imei => {
  try {
    const response = await ApiService.post('new_getimei_nuV4', { imei });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const get_support_detail = async () => {
  try {
    const response = await ApiService.post('get_support_detail', {});
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const getEmployeDetails = async imei => {
  try {
    const response = await ApiService.post('get_employe_data', { imei });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const getCurrentLoad = async imei => {
  try {
    const response = await ApiService.post('get_current_load', { imei });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const getCurrentRunHours = async imei => {
  try {
    const response = await ApiService.post('currentrunhours', { imei });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const getSiteDetailV2 = async imei => {
  try {
    const response = await ApiService.post('new_getimei_nu', { imei });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const hooter_on_off = async (imei, hooter_onoff) => {
  try {
    const response = await ApiService.post('hooter_on_off', {
      imei,
      hooter_onoff,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const insert_Hooter_log = async (imei, aid, login_id, status) => {
  try {
    const response = await ApiService.post('insert_Hooter_log', {
      imei,
      aid,
      login_id,
      status,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};

export const getSiteDetailv1 = async imei => {
  try {
    const response = await ApiService.post('new_getimei_nuV1', { imei });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const getAlarmV1 = async imei => {
  try {
    const response = await ApiService.post('new_alarm_V1', { imei });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const getLogReport = async (
  imei,
  aid,
  ctm_id,
  s_date,
  e_date,
  usertype,
  client_version,
) => {
  try {
    const response = await ApiService.post('getAlarmLogByImei', {
      imei,
      aid,
      ctm_id,
      s_date,
      e_date,
      usertype,
      client_version,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};

export const getSiteRunningSource = async (
  aidv4,
  ctm_idv4,
  usertypev4,
  state_id,
  dist_id,
  cluster_id,
  aidv2,
  ctm_idv2,
  usertypev2,
) => {
  try {
    const response = await ApiService.post('new_siteRunningSource', {
      aidv4,
      ctm_idv4,
      usertypev4,
      state_id,
      dist_id,
      cluster_id,
      aidv2,
      ctm_idv2,
      usertypev2,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const siteRunning = async (
  aidv4,
  ctm_idv4,
  usertypev4,
  state_id,
  dist_id,
  cluster_id,
  aidv2,
  ctm_idv2,
  usertypev2,
) => {
  try {
    const response = await ApiService.post('new_siteRunning', {
      aidv4,
      ctm_idv4,
      usertypev4,
      state_id,
      dist_id,
      cluster_id,
      aidv2,
      ctm_idv2,
      usertypev2,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const getcurrentAlarmByImei = async imei => {
  try {
    const response = await ApiService.post('new_getcurrentAlarmByImeiV4', {
      imei,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const getcurrentAlarmByImeiv2 = async imei => {
  try {
    const response = await ApiService.post('new_getcurrentAlarmByImei', {
      imei,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const notification = async (
  aidv1,
  aidv2,
  aidv4,
  userv1,
  userv2,
  userv4,
  value,
) => {
  try {
    const response = await ApiService.post('noncom2hour', {
      aidv1,
      aidv2,
      aidv4,
      userv1,
      userv2,
      userv4,
      value,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};

export const dcem_analytics = async imei => {
  try {
    const response = await ApiService.post('dcem_analytics', { imei });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const dg_on_off = async (imei, value) => {
  try {
    const response = await ApiService.post('dg_on_off', { imei, value });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const auto_manul = async (imei, value) => {
  try {
    const response = await ApiService.post('auto_manul', { imei, value });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const auto_manual_show = async imei => {
  try {
    const response = await ApiService.post('auto_manual_show', { imei });
    return response?.data;
  } catch (error) {
    throw error;
  }
};

export default ApiService;
