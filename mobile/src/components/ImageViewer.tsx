import React, { useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  Text
} from 'react-native';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import { PanGestureHandlerGestureEvent, PinchGestureHandlerGestureEvent, PanGestureHandlerStateChangeEvent, PinchGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, runOnJS } from 'react-native-reanimated';
import { getImageUrl } from '../services/api';

interface ImageViewerProps {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ visible, imageUrl, onClose }) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Valores animados para zoom y pan
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lastScale = useSharedValue(1);
  const lastTranslateX = useSharedValue(0);
  const lastTranslateY = useSharedValue(0);

  const resetZoom = () => {
    scale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    lastScale.value = 1;
    lastTranslateX.value = 0;
    lastTranslateY.value = 0;
  };

  const panGestureHandler = useAnimatedGestureHandler({
    onStart: (_: any, context: any) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
    },
    onActive: (event: any, context: any) => {
      if (scale.value > 1) {
        translateX.value = context.startX + event.translationX;
        translateY.value = context.startY + event.translationY;
      }
    },
    onEnd: () => {
      // Limitar el pan para que la imagen no se salga demasiado de la pantalla
      const maxTranslateX = (screenWidth * (scale.value - 1)) / 2;
      const maxTranslateY = (screenHeight * (scale.value - 1)) / 2;

      if (translateX.value > maxTranslateX) translateX.value = maxTranslateX;
      if (translateX.value < -maxTranslateX) translateX.value = -maxTranslateX;
      if (translateY.value > maxTranslateY) translateY.value = maxTranslateY;
      if (translateY.value < -maxTranslateY) translateY.value = -maxTranslateY;
    },
  });

  const pinchGestureHandler = useAnimatedGestureHandler({
    onActive: (event: any) => {
      scale.value = Math.max(0.5, Math.min(3, lastScale.value * event.scale));
    },
    onEnd: () => {
      lastScale.value = scale.value;
      if (scale.value <= 1) {
        runOnJS(resetZoom)();
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const handleClose = () => {
    resetZoom();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        {/* Header con botón de cerrar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Contenedor de la imagen con gestos */}
        <View style={styles.imageContainer}>
          <PinchGestureHandler onGestureEvent={pinchGestureHandler}>
            <Animated.View style={styles.imageWrapper}>
              <PanGestureHandler onGestureEvent={panGestureHandler}>
                <Animated.View style={animatedStyle}>
                  <Image
                    source={{ uri: getImageUrl(imageUrl) }}
                    style={{
                      width: screenWidth,
                      height: screenHeight * 0.7,
                    }}
                    resizeMode="contain"
                  />
                </Animated.View>
              </PanGestureHandler>
            </Animated.View>
          </PinchGestureHandler>
        </View>

        {/* Footer con instrucciones */}
        <View style={styles.footer}>
          <Text style={styles.hintText}>
            {scale.value > 1 ? 'Pinch to zoom out • Drag to pan' : 'Pinch to zoom in'}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 20,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  hintText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ImageViewer;