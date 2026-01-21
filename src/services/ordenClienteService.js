import api from './api';

/**
 * Servicio de Órdenes de Cliente
 * Conecta con endpoints: /ordenes-clientes/
 * (NO agregar /api, ya viene en baseURL)
 */

export const getOrdenesCliente = async (params = {}) => {
  try {
    const response = await api.get('/ordenes-clientes/', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al cargar órdenes' };
  }
};

export const getOrdenCliente = async (id) => {
  try {
    const response = await api.get(`/ordenes-clientes/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al cargar orden' };
  }
};

export const createOrdenCliente = async (data) => {
  try {
    const response = await api.post('/ordenes-clientes/', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al crear orden' };
  }
};

export const updateOrdenCliente = async (id, data) => {
  try {
    const response = await api.put(`/ordenes-clientes/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al actualizar orden' };
  }
};

export const patchOrdenCliente = async (id, data) => {
  try {
    const response = await api.patch(`/ordenes-clientes/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al actualizar orden' };
  }
};

export const deleteOrdenCliente = async (id) => {
  try {
    const response = await api.delete(`/ordenes-clientes/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al eliminar orden' };
  }
};
