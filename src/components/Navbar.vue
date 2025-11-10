<template>
	<nav class="navbar">
		<div class="nav-left">
			<router-link to="/">Inicio</router-link>
			<router-link to="/dashboard">Dashboard</router-link>
		</div>

		<div class="nav-right">
			<router-link v-if="!logged" to="/login">Login</router-link>
			<router-link v-if="!logged" to="/registro">Registro</router-link>
			<button v-if="logged" @click="doLogout">Cerrar sesión</button>
		</div>
	</nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import auth from '../services/auth'
import './navbar.css'

const router = useRouter()
const logged = ref(auth.isAuthenticated())

function onAuthChange() {
	logged.value = auth.isAuthenticated()
}

onMounted(() => {
	window.addEventListener('auth-change', onAuthChange)
})

onUnmounted(() => {
	window.removeEventListener('auth-change', onAuthChange)
})

function doLogout() {
	auth.logout()
	window.dispatchEvent(new Event('auth-change'))
	router.push('/login')
}
</script>

