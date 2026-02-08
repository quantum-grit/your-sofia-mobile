import React, {forwardRef, useImperativeHandle, useCallback, useMemo} from 'react'
import {View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert} from 'react-native'
import {useForm, Controller} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {useTranslation} from 'react-i18next'
import {MapPin, Calendar, FileText, Tag, AlertCircle, Camera, Upload, X} from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'
import {signalFormSchema, type SignalFormData, type SignalFormProps} from './schema'
import {styles} from './signal.styles'
import {CONTAINER_STATES, getStateColor} from '../../types/wasteContainer'
import type {Signal} from '../../types/signal'

export const SignalForm = forwardRef<any, SignalFormProps>(
  ({signal, onSubmit, onCancel, isSubmitting = false, isEditing = true, canEdit = false}, ref) => {
    const {t, i18n} = useTranslation()

    const {
      control,
      handleSubmit,
      formState: {errors},
      setValue,
      watch,
    } = useForm<SignalFormData>({
      resolver: zodResolver(signalFormSchema),
      defaultValues: {
        title: signal.title || '',
        description: signal.description || '',
        containerState: signal.containerState || [],
        photos:
          signal.images?.map((img) => ({
            id: img.id,
            uri: img.url,
            isNew: false,
          })) || [],
      },
    })

    // Expose handleSubmit to parent component
    useImperativeHandle(ref, () => ({
      handleSubmit,
    }))

    const selectedStates = watch('containerState') || []
    const watchedPhotos = watch('photos')
    const photos = useMemo(() => watchedPhotos || [], [watchedPhotos])

    const removePhoto = useCallback(
      (photoId: number) => {
        const currentPhotos = photos.filter((p) => p.id !== photoId)
        setValue('photos', currentPhotos)
      },
      [photos, setValue]
    )

    const takePhoto = useCallback(async () => {
      try {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync()
        if (!permissionResult.granted) {
          Alert.alert(t('common.error'), t('newSignal.cameraPermissionRequired'))
          return
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 0.8,
        })

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0]
          const newPhoto = {
            uri: asset.uri,
            isNew: true,
          }
          setValue('photos', [...photos, newPhoto])
        }
      } catch (error) {
        console.error('Error taking photo:', error)
        Alert.alert(t('common.error'), t('newSignal.photoError'))
      }
    }, [photos, setValue, t])

    const pickFromGallery = useCallback(async () => {
      try {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!permissionResult.granted) {
          Alert.alert(t('common.error'), t('newSignal.galleryPermissionRequired'))
          return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 0.8,
          allowsMultipleSelection: true,
        })

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const newPhotos = result.assets.map((asset, index) => ({
            id: Date.now() + index,
            uri: asset.uri,
            isNew: true,
          }))
          setValue('photos', [...photos, ...newPhotos])
        }
      } catch (error) {
        console.error('Error picking from gallery:', error)
        Alert.alert(t('common.error'), t('newSignal.photoError'))
      }
    }, [photos, setValue, t])

    const toggleState = (state: string) => {
      const newStates = selectedStates.includes(state)
        ? selectedStates.filter((s) => s !== state)
        : [...selectedStates, state]
      setValue('containerState', newStates)
    }

    const getStatusIcon = (status: Signal['status']) => {
      const iconProps = {size: 20}
      switch (status) {
        case 'pending':
          return <AlertCircle {...iconProps} color="#F59E0B" />
        case 'in-progress':
          return <AlertCircle {...iconProps} color="#3B82F6" />
        case 'resolved':
          return <AlertCircle {...iconProps} color="#10B981" />
        case 'rejected':
          return <AlertCircle {...iconProps} color="#EF4444" />
        default:
          return null
      }
    }

    const getStatusColor = (status: Signal['status']) => {
      const colors = {
        pending: '#F59E0B',
        'in-progress': '#3B82F6',
        resolved: '#10B981',
        rejected: '#EF4444',
      }
      return colors[status] || '#6B7280'
    }

    return (
      <View>
        {/* Status and Category Badges */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginBottom: 4,
            flexWrap: 'wrap',
          }}
        >
          <View
            style={[styles.statusBadge, {backgroundColor: `${getStatusColor(signal.status)}20`}]}
          >
            {getStatusIcon(signal.status)}
            <Text style={[styles.statusText, {color: getStatusColor(signal.status)}]}>
              {t(`signals.status.${signal.status}`)}
            </Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.metaText}>
              {new Date(signal.createdAt).toLocaleDateString(i18n.language, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        {signal.cityObject?.name && (
          <View style={styles.section}>
            <View style={styles.metaRow}>
              {/* City Object */}
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.metaText}>{signal.cityObject.name}</Text>
            </View>
          </View>
        )}

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('signals.form.title')}</Text>
          {isEditing ? (
            <>
              <Controller
                control={control}
                name="title"
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    style={[styles.input, errors.title && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('signals.form.titlePlaceholder')}
                    editable={!isSubmitting}
                  />
                )}
              />
              {errors.title && (
                <Text style={styles.errorText}>{t(errors.title.message || '')}</Text>
              )}
            </>
          ) : (
            <Text style={styles.descriptionText}>{signal.title}</Text>
          )}
        </View>

        {/* Container State */}
        {signal.category === 'waste-container' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('signals.form.containerState')}</Text>
            <View style={styles.stateTagsContainer}>
              {isEditing
                ? CONTAINER_STATES.map((state) => (
                    <TouchableOpacity
                      key={state}
                      style={[
                        styles.stateTag,
                        selectedStates.includes(state) && {
                          backgroundColor: getStateColor(state),
                          borderColor: getStateColor(state),
                        },
                      ]}
                      onPress={() => toggleState(state)}
                      disabled={isSubmitting}
                    >
                      <Text
                        style={[
                          styles.stateTagText,
                          selectedStates.includes(state) && styles.stateTagTextSelected,
                        ]}
                      >
                        {t(`signals.containerStates.${state}`)}
                      </Text>
                    </TouchableOpacity>
                  ))
                : (signal.containerState || []).map((state) => (
                    <View
                      key={state}
                      style={[
                        styles.stateTag,
                        {
                          backgroundColor: getStateColor(state),
                          borderColor: getStateColor(state),
                        },
                      ]}
                    >
                      <Text style={styles.stateTagTextSelected}>
                        {t(`signals.containerStates.${state}`)}
                      </Text>
                    </View>
                  ))}
            </View>
          </View>
        )}

        {/* Images */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('signals.form.photos')}</Text>

          {photos && photos.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.imagesContainer}>
                {photos.map((photo, index) => (
                  <View key={photo.id || index} style={styles.photoWrapper}>
                    <Image source={{uri: photo.uri}} style={styles.image} resizeMode="cover" />
                    {isEditing && (
                      <TouchableOpacity
                        style={styles.deletePhotoButton}
                        onPress={() => photo.id && removePhoto(photo.id)}
                        disabled={isSubmitting}
                      >
                        <X size={16} color="#ffffff" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          {isEditing && (
            <View style={{flexDirection: 'row', gap: 8, marginTop: 12}}>
              <TouchableOpacity
                style={[styles.photoButton, {flex: 1}]}
                onPress={takePhoto}
                disabled={isSubmitting}
              >
                <Camera size={20} color="#1E40AF" />
                <Text style={styles.photoButtonText}>{t('signals.form.takePhoto')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.photoButton, {flex: 1}]}
                onPress={pickFromGallery}
                disabled={isSubmitting}
              >
                <Upload size={20} color="#1E40AF" />
                <Text style={styles.photoButtonText}>{t('signals.form.chooseFromGallery')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* City Object */}
        {signal.cityObject?.name && (
          <View style={styles.section}>
            <View style={styles.metaRow}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.metaText}>{signal.cityObject.name}</Text>
            </View>
          </View>
        )}

        {/* Location */}
        {signal.location?.address && (
          <View style={styles.section}>
            <View style={styles.metaRow}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.metaText}>{signal.location.address}</Text>
            </View>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('signals.form.description')}</Text>
          {isEditing ? (
            <Controller
              control={control}
              name="description"
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('signals.form.descriptionPlaceholder')}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isSubmitting}
                />
              )}
            />
          ) : (
            <Text style={styles.descriptionText}>
              {signal.description || t('signals.form.noDescription')}
            </Text>
          )}
        </View>

        {/* Admin Notes */}
        {signal.adminNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('signals.adminNotes')}</Text>
            <View style={styles.adminNotesContainer}>
              <FileText size={16} color="#1E40AF" />
              <Text style={styles.adminNotesText}>{signal.adminNotes}</Text>
            </View>
          </View>
        )}

        {/* Edit Permission Info */}
        {!canEdit && !isEditing && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>{t('signals.cannotEdit')}</Text>
          </View>
        )}
      </View>
    )
  }
)

SignalForm.displayName = 'SignalForm'
