import api from './api';

/**
 * Servicio de Items de Orden
 * Conecta con endpoints anidados en: /ordenes-clientes/{id}/items/
 * Los items se gestionan principalmente a través de la orden
 * (NO agregar /api, ya viene en baseURL)
 */

export const getOrdenItems = async (ordenId, params = {}) => {
  try {
    const response = await api.get(`/ordenes-clientes/${ordenId}/items/`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al cargar items' };
  }
};

export const getOrdenItem = async (ordenId, itemId) => {
  try {
    const response = await api.get(`/ordenes-clientes/${ordenId}/items/${itemId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al cargar item' };
  }
};

export const createOrdenItem = async (ordenId, data) => {
  try {
    const response = await api.post(`/ordenes-clientes/${ordenId}/items/`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al crear item' };
  }
};

export const updateOrdenItem = async (ordenId, itemId, data) => {
  try {
    const response = await api.put(`/ordenes-clientes/${ordenId}/items/${itemId}/`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al actualizar item' };
  }
};

export const deleteOrdenItem = async (ordenId, itemId) => {
  try {
    const response = await api.delete(`/ordenes-clientes/${ordenId}/items/${itemId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al eliminar item' };
  }
};
