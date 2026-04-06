import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { checkExistingRequest, createRequest } from '../../apis/requestAPI';

const timeRemaining = (bestBefore) => {
  const diff = new Date(bestBefore) - new Date();
  if (diff <= 0) return 'Expired';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
};

const isExpiringSoon = (bestBefore) => {
  const diff = new Date(bestBefore) - new Date();
  return diff > 0 && diff <= 7200000;
};

const formatPostedTime = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export default function PostDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { post } = route.params;

  const [requestStatus, setRequestStatus] = useState(null); // null | 'pending' | 'accepted' | 'rejected'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        const user = JSON.parse(userStr);
        setCurrentUser(user);

        const res = await checkExistingRequest(post._id, user._id);
        if (res.exists) {
          setRequestStatus(res.status || 'pending');
        }
      } catch (err) {
        console.error('Init error:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [post._id]);

  const handleRequest = async () => {
    if (!currentUser) return;
    try {
      setSubmitting(true);
      await createRequest({
        postId: post._id,
        requesterId: currentUser._id,
        receiverId: post.createdBy,
      });
      setRequestStatus('pending');
    } catch (err) {
      console.error('Request failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const soon = isExpiringSoon(post.bestBefore);
  const isExpired = new Date(post.bestBefore) <= new Date();

  const InfoRow = ({ label, value, valueStyle }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueStyle]}>{value}</Text>
    </View>
  );

  const renderButton = () => {
    if (loading) return null;

    if (isExpired) {
      return (
        <View style={styles.footerBtn}>
          <Text style={styles.footerBtnUnavailable}>This post has expired</Text>
        </View>
      );
    }

    if (post.status === 'accepted' || post.status === 'fulfilled') {
      return (
        <View style={styles.footerBtn}>
          <Text style={styles.footerBtnUnavailable}>No longer available</Text>
        </View>
      );
    }

    if (requestStatus === 'pending') {
      return (
        <View style={[styles.footerBtn, styles.footerBtnRequested]}>
          <Text style={styles.footerBtnRequestedText}>Request sent · Waiting for response</Text>
        </View>
      );
    }

    if (requestStatus === 'accepted') {
      return (
        <View style={[styles.footerBtn, styles.footerBtnAccepted]}>
          <Text style={styles.footerBtnAcceptedText}>Request accepted · Check Messages</Text>
        </View>
      );
    }

    if (requestStatus === 'rejected') {
      return (
        <View style={[styles.footerBtn, styles.footerBtnUnavailableWrap]}>
          <Text style={styles.footerBtnUnavailable}>Unavailable for this request</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.footerBtn, styles.footerBtnActive]}
        onPress={handleRequest}
        disabled={submitting}
        activeOpacity={0.8}
      >
        {submitting
          ? <ActivityIndicator size="small" color="#fff" />
          : <Text style={styles.footerBtnText}>Request Food</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Food title */}
        <View style={styles.titleSection}>
          <Text style={styles.foodTitle}>{post.foodType}</Text>
          {soon && !isExpired && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>Pickup soon</Text>
            </View>
          )}
        </View>

        {/* Details block */}
        <View style={styles.detailsBlock}>
          <InfoRow
            label="Quantity"
            value={`${post.quantity} ${post.quantityUnit || 'servings'}`}
          />
          <View style={styles.detailDivider} />
          <InfoRow
            label="Time remaining"
            value={timeRemaining(post.bestBefore)}
            valueStyle={soon && !isExpired ? styles.urgentValue : null}
          />
          {post.area ? (
            <>
              <View style={styles.detailDivider} />
              <InfoRow label="Pickup area" value={post.area} />
            </>
          ) : null}
          <View style={styles.detailDivider} />
          <InfoRow label="Posted by" value={post.userName} />
          <View style={styles.detailDivider} />
          <InfoRow label="Posted" value={formatPostedTime(post.createdAt)} />
        </View>

        {/* Description */}
        {post.description ? (
          <View style={styles.descSection}>
            <Text style={styles.descLabel}>Notes from donor</Text>
            <Text style={styles.descText}>{post.description}</Text>
          </View>
        ) : null}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer action */}
      <View style={styles.footer}>
        {renderButton()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backText: {
    fontSize: 16,
    color: '#356F59',
    fontWeight: '500',
  },
  scroll: { flex: 1 },
  titleSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  foodTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  urgentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFF3CD',
  },
  urgentText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#E08B00',
  },
  detailsBlock: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  urgentValue: {
    color: '#E08B00',
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 14,
  },
  descSection: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  descLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B6B6B',
    marginBottom: 6,
  },
  descText: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  footerBtn: {
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnActive: {
    backgroundColor: '#356F59',
  },
  footerBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  footerBtnRequested: {
    backgroundColor: '#F6F6F6',
  },
  footerBtnRequestedText: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  footerBtnAccepted: {
    backgroundColor: '#E8F1EE',
  },
  footerBtnAcceptedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#356F59',
  },
  footerBtnUnavailableWrap: {
    backgroundColor: '#F6F6F6',
  },
  footerBtnUnavailable: {
    fontSize: 14,
    color: '#ABABAB',
  },
});
