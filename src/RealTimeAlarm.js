import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  AppState,
  TextInput,
} from 'react-native';
import Back from '../assets/svg/back.svg';
import SearchIcon from '../assets/svg/searchicon.svg';
import { useNavigation } from '@react-navigation/native';
import { realTimealarm } from './service/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RealTimeAlarm = () => {
  const navigation = useNavigation();
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(60);

  // Filter states - these persist until explicitly cleared
  const [appliedFilters, setAppliedFilters] = useState({
    status: 'all',
    search: '',
  });

  // UI states for filters
  const [filterType, setFilterType] = useState('all'); // This follows appliedFilters.status
  const [searchText, setSearchText] = useState(''); // This follows appliedFilters.search

  const ITEMS_PER_PAGE = 10;
  const AUTO_REFRESH_INTERVAL = 60000; // 1 minute in milliseconds

  const intervalRef = useRef(null);
  const countdownRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const appliedFiltersRef = useRef(appliedFilters);
  const searchTimeoutRef = useRef(null);

  // Update the ref whenever appliedFilters changes
  useEffect(() => {
    appliedFiltersRef.current = appliedFilters;
  }, [appliedFilters]);

  // Sync UI states with applied filters
  useEffect(() => {
    setFilterType(appliedFilters.status);
    setSearchText(appliedFilters.search);
  }, [appliedFilters]);

  // Apply filters and fetch data
  const applyFiltersAndFetch = newFilters => {
    console.log('Applying filters:', newFilters);
    setAppliedFilters(newFilters);
    setCurrentPage(1);
    setHasMore(true);
    stopAutoRefresh();
    fetchAlarms(1, true, false, newFilters).then(() => {
      setRefreshCountdown(60);
      startAutoRefresh();
    });
  };

  // Handle status filter change
  const handleStatusFilterChange = status => {
    const newFilters = { ...appliedFilters, status };
    console.log('Status filter changed to:', status);
    applyFiltersAndFetch(newFilters);
  };

  // Handle search with debouncing
  const onSearch = text => {
    setSearchText(text);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      const newFilters = { ...appliedFilters, search: text };
      console.log('Search filter changed to:', newFilters);
      applyFiltersAndFetch(newFilters);
    }, 500); // 500ms delay
  };

  // Main fetch function - ALWAYS use the filters parameter passed to it
  const fetchAlarms = async (
    page = 1,
    isRefresh = false,
    isAutoRefresh = false,
    filters = appliedFilters, // Default to current applied filters
  ) => {
    if (loading && !isRefresh && !isAutoRefresh) return;

    try {
      if (isAutoRefresh) {
        setIsAutoRefreshing(true);
      } else if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const userDataString = await AsyncStorage.getItem('user_data');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const {
          login_id,
          aidv4,
          aidv1,
          user_typev1,
          user_typev4,
          ctmidv1,
          ctmidv4,
          state,
          district,
          cluster,
        } = userData;

        console.log(
          'Fetching alarms - Page:',
          page,
          'Filters being used:',
          filters,
        );

        // IMPORTANT: Always use the filters parameter passed to this function
        const responsedata = await realTimealarm(
          login_id,
          aidv4,
          user_typev4,
          aidv1,
          user_typev1,
          ctmidv1,
          ctmidv4,
          state,
          district,
          cluster,
          page,
          ITEMS_PER_PAGE,
          filters.status, 
          filters.search, 
        );

        console.log('API Response for page', page, ':', responsedata);

        if (responsedata.data) {
          const newAlarms = responsedata.data.records || [];
          const total = responsedata.data.total || 0;
          const totalPages = responsedata.data.total_pages || 0;

          setTotalRecords(total);
          setLastRefreshTime(new Date());

          if (isRefresh || isAutoRefresh || page === 1) {
            setAlarms(newAlarms);
            setCurrentPage(1);
            setHasMore(1 < totalPages);
          } else {
            setAlarms(prev => [...prev, ...newAlarms]);
            setHasMore(page < totalPages);
            setCurrentPage(page);
          }
        }
      } else {
        console.log('No user data found in storage');
      }
    } catch (error) {
      console.error('Error fetching alarms:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsAutoRefreshing(false);
    }
  };

  // Auto refresh function - maintains current filters
  const startAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    // Reset countdown to 60 seconds
    setRefreshCountdown(60);

    // Start countdown timer (updates every second)
    countdownRef.current = setInterval(() => {
      setRefreshCountdown(prev => {
        if (prev <= 1) {
          return 60; // Reset countdown when it reaches 0
        }
        return prev - 1;
      });
    }, 1000);

    intervalRef.current = setInterval(() => {
      console.log(
        'Auto refreshing alarms with current filters:',
        appliedFiltersRef.current,
      );
      fetchAlarms(1, false, true, appliedFiltersRef.current); // Use ref instead
      setRefreshCountdown(60);
    }, AUTO_REFRESH_INTERVAL);
  };

  // Stop auto refresh
  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    setRefreshCountdown(0);
  };

  // Handle app state changes
  const handleAppStateChange = nextAppState => {
    if (
      appStateRef.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // App came to foreground, restart auto refresh with current filters
      console.log(
        'App came to foreground, restarting auto refresh with filters:',
        appliedFilters,
      );
      startAutoRefresh();
    } else if (nextAppState.match(/inactive|background/)) {
      // App went to background, stop auto refresh
      console.log('App went to background, stopping auto refresh');
      stopAutoRefresh();
    }
    appStateRef.current = nextAppState;
  };

  useEffect(() => {
    // Initial fetch with default filters
    console.log('Initial fetch with filters:', appliedFilters);
    fetchAlarms(1, false, false, appliedFilters);

    // Start auto refresh
    startAutoRefresh();

    // Listen to app state changes
    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    // Cleanup on unmount
    return () => {
      stopAutoRefresh();
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      appStateSubscription?.remove();
    };
  }, []); // Remove appliedFilters from dependency array

  const onBackPress = () => {
    navigation.goBack();
  };

  // Manual refresh - maintains current filters
  const handleRefresh = () => {
    console.log('Manual refresh with current filters:', appliedFilters);
    setCurrentPage(1);
    setHasMore(true);
    stopAutoRefresh();
    fetchAlarms(1, true, false, appliedFilters).then(() => {
      setRefreshCountdown(60);
      startAutoRefresh();
    });
  };

  const formatTimeOnly = datetime => {
    if (!datetime || datetime === '-') return '-';
    const timePart = datetime.includes(' ') ? datetime.split(' ')[1] : datetime;
    return timePart || datetime;
  };

  // Load more - maintains current filters
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      console.log('Loading more with current filters:', appliedFilters);
      fetchAlarms(currentPage + 1, false, false, appliedFilters);
    }
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (appliedFilters.status !== 'all') count++;
    if (appliedFilters.search !== '') count++;
    return count;
  };

  // Clear all filters - explicitly reset to defaults
  const clearAllFilters = () => {
    const defaultFilters = { status: 'all', search: '' };
    console.log('Clearing all filters, resetting to:', defaultFilters);

    // Clear search timeout if exists
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    applyFiltersAndFetch(defaultFilters);
  };
  const NavigatetSite=(item)=>{
    //  console.log("hello")
    //  console.log(item.imei);
   
      navigation.navigate('SiteDetail', {
        imei: item?.imei,
        mode: false,
        version: item?.client_version,
      })
  
  }

  // Render each alarm item
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: item.color_code }]}
      onPress={() => NavigatetSite(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.alarmName}>{item.alarm_name}</Text>
        <Text style={styles.time}>S-T: {formatTimeOnly(item.create_dt)}</Text>

        {item.client_version === 'v4' ? (
          <Text style={styles.time}>E-T: {formatTimeOnly(item.end_time)}</Text>
        ) : (
          <Text></Text>
        )}
      </View>

      <View style={styles.cardHeader}>
        {item.volt && <Text style={styles.volt}>Volt: {item.volt}</Text>}
        <Text style={styles.siteId}>G-ID: {item.globel_id}</Text>
        <Text style={styles.siteName}>Site: {item.site_name || 'N/A'}</Text>
      </View>
    </TouchableOpacity>
  );


  // Render footer with loading indicator
  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#0a478f" />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  // Render empty component
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No alarms available</Text>
      {getActiveFilterCount() > 0 && (
        <Text style={styles.emptySubText}>
          Try clearing filters to see more results
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.subContainer}>
        <TouchableOpacity onPress={onBackPress}>
          <Back width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Real Time Alarm</Text>
      </View>

      {/* Records count and refresh status */}
      {totalRecords > 0 && (
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            Total Records: {totalRecords} | Showing: {alarms.length}
          </Text>
          {getActiveFilterCount() > 0 && (
            <Text style={styles.filterStatusText}>
              {getActiveFilterCount()} filter(s) applied
            </Text>
          )}
          <View style={styles.refreshInfo}>
            {refreshCountdown > 0 && (
              <View style={styles.countdownContainer}>
                <Text style={styles.countdownText}>
                  Next refresh in: {refreshCountdown}s
                </Text>
                <View style={styles.countdownBar}>
                  <View
                    style={[
                      styles.countdownProgress,
                      { width: `${(refreshCountdown / 60) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            )}
            {isAutoRefreshing && (
              <View style={styles.autoRefreshIndicator}>
                <ActivityIndicator size="small" color="#0a478f" />
                <Text style={styles.autoRefreshText}>Auto refreshing...</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Filter Container */}
      <View style={styles.filterMainContainer}>
        {/* Search Bar */}
        <View style={styles.SearchContainer}>
          <SearchIcon width={20} height={20} style={styles.SearchIcon} />
          <TextInput
            style={styles.SearchInput}
            placeholder="Search Alarm, Global_id, Site Name"
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={onSearch}
          />
        </View>

        {/* Status Filters */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterType === 'all' && styles.filterActive,
            ]}
            onPress={() => handleStatusFilterChange('all')}
          >
            <Text
              style={[
                styles.filterText,
                filterType === 'all' && { color: 'white' },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filterType === 'open' && styles.filterActive,
            ]}
            onPress={() => handleStatusFilterChange('open')}
          >
            <Text
              style={[
                styles.filterText,
                filterType === 'open' && { color: 'white' },
              ]}
            >
              Open
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filterType === 'closed' && styles.filterActive,
            ]}
            onPress={() => handleStatusFilterChange('closed')}
          >
            <Text
              style={[
                styles.filterText,
                filterType === 'closed' && { color: 'white' },
              ]}
            >
              Closed
            </Text>
          </TouchableOpacity>
        </View>

        {/* Clear All Filters */}
        {getActiveFilterCount() > 0 && (
          <View style={styles.clearAllContainer}>
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={clearAllFilters}
            >
              <Text style={styles.clearAllButtonText}>
                Clear All ({getActiveFilterCount()})
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Alarm List */}
      <FlatList
        data={alarms}
        keyExtractor={(item, index) => `${item.site_id}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  subContainer: {
    flexDirection: 'row',
    backgroundColor: '#0a478f',
    padding: 15,
    alignItems: 'center',
    elevation: 3,
  },
  title: {
    fontSize: 20,
    color: 'white',
    marginLeft: 16,
    fontWeight: '600',
  },
  countContainer: {
    backgroundColor: 'white',
    padding: 10,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8,
    elevation: 1,
  },
  countText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  filterStatusText: {
    fontSize: 12,
    color: '#0a478f',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
  refreshInfo: {
    marginTop: 8,
    alignItems: 'center',
  },
  autoRefreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  autoRefreshText: {
    fontSize: 12,
    color: '#0a478f',
    marginLeft: 6,
  },
  countdownContainer: {
    marginTop: 5,
    alignItems: 'center',
    width: '100%',
  },
  countdownText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
  },
  countdownBar: {
    width: '80%',
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  countdownProgress: {
    height: '100%',
    backgroundColor: '#0a478f',
    borderRadius: 2,
  },
  filterMainContainer: {
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 8,
    padding: 10,
    elevation: 1,
  },
  SearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  SearchIcon: {
    marginRight: 10,
    tintColor: '#6c757d',
  },
  SearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  clearAllContainer: {
    alignItems: 'center',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: '#0a478f',
    borderRadius: 20,
    backgroundColor: 'white',
  },
  filterActive: {
    backgroundColor: '#0a478f',
  },
  filterText: {
    color: '#0a478f',
    fontWeight: '600',
    fontSize: 14,
  },
  clearAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#dc3545',
    borderRadius: 20,
    backgroundColor: '#dc3545',
  },
  clearAllButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  listContainer: {
    padding: 10,
    paddingBottom: 15,
  },
  card: {
    backgroundColor: 'white',
    padding: 8,
    marginVertical: 5,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderLeftWidth: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 2,
  },
  alarmName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    
  },
  siteId: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  siteName: {
    fontSize: 12,
    color: '#0a478f',
    fontWeight: '600',
  },
  time: {
    fontSize: 14,
    color: '#444',
  },
  volt: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default RealTimeAlarm;