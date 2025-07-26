/*useEffect(() => {
  async function checkUserStatus() {
    const token = await AsyncStorage.getItem('token');
    const user = JSON.parse(await AsyncStorage.getItem('user'));
    
    if (token && user) {
      try {
        const response = await fetch('/api/user/status');
        const data = await response.json();
        
        if (user.role === 'admin') {
          // Admin goes directly to admin dashboard
          navigation.navigate('AdminStack');
        } 
        else if (data.status === 'pending') {
          navigation.navigate('UserPendingScreen');
        }
        else if (data.status === 'approved') {
          if (user.role === 'restaurant') navigation.navigate('RestaurantStack');
          else if (user.role === 'charity') navigation.navigate('CharityStack');
        }
        else if (data.status === 'rejected') {
          navigation.navigate('RejectionNoticeScreen', { 
            message: data.message 
          });
        }
      } catch (error) {
        console.error('Status check failed', error);
      }
    }
  }
  checkUserStatus();
}, []);*/