<template>
    <div class="hero-search">
        <!-- Animated Background -->
        <div class="hero-bg">
            <div class="floating-particles">
                <div class="particle" v-for="n in 12" :key="n"></div>
            </div>
            <div class="gradient-orbs">
                <div class="orb orb-1"></div>
                <div class="orb orb-2"></div>
                <div class="orb orb-3"></div>
            </div>
        </div>

        <!-- Hero Content -->
        <div class="hero-content">
            <div class="hero-text">
                <h1 class="hero-title">
                    <span class="title-main">Discover Your Next</span>
                    <span class="title-accent">Cinematic Adventure</span>
                </h1>
                <p class="hero-subtitle">
                    Explore millions of movies, TV shows, and hidden gems from around the world
                </p>
            </div>

            <!-- Advanced Search Form -->
            <div class="search-container">
                <form @submit.prevent="handleSearch" class="search-form">
                    <!-- Main Search Input -->
                    <div class="search-input-wrapper">
                        <div class="search-icon-left">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M21 21L16.514 16.506M19 10.5A8.5 8.5 0 1 1 10.5 2a8.5 8.5 0 0 1 8.5 8.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </div>
                        <input 
                            type="text" 
                            v-model="searchValue"
                            placeholder="Search movies, TV shows, actors..."
                            class="search-input"
                            @keyup.enter="handleSearch"
                            @focus="isInputFocused = true"
                            @blur="isInputFocused = false"
                        >
                        <button 
                            type="submit" 
                            class="search-submit"
                            :class="{ 'active': searchValue.trim() }"
                            :disabled="!searchValue.trim()"
                        >
                            <span class="submit-text">Search</span>
                            <svg class="submit-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12h14m-7-7 7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Quick Search Suggestions -->
                    <div class="quick-suggestions" :class="{ 'focused': isInputFocused }">
                        <span class="suggestions-label">Popular searches:</span>
                        <div class="suggestion-tags">
                            <button 
                                type="button"
                                v-for="suggestion in popularSearches" 
                                :key="suggestion"
                                @click="quickSearch(suggestion)"
                                class="suggestion-tag"
                            >
                                {{ suggestion }}
                            </button>
                        </div>
                    </div>
                </form>

                <!-- Search Stats -->
                <div class="search-stats">
                    <div class="stat-item">
                        <span class="stat-number">500K+</span>
                        <span class="stat-label">Movies</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <span class="stat-number">100K+</span>
                        <span class="stat-label">TV Shows</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <span class="stat-number">1M+</span>
                        <span class="stat-label">Reviews</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Scroll Indicator -->
        <div class="scroll-indicator">
            <div class="scroll-text">Scroll to explore</div>
            <div class="scroll-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M7 13l5 5 5-5M7 6l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['search']);

const searchValue = ref('');
const isInputFocused = ref(false);

const popularSearches = [
    'Avengers', 'Game of Thrones', 'Breaking Bad', 'Marvel', 'Christopher Nolan', 'Sci-Fi'
];

const handleSearch = () => {
    if (searchValue.value.trim()) {
        emit('search', searchValue.value);
        searchValue.value = '';
    }
};

const quickSearch = (term: string) => {
    searchValue.value = term;
    emit('search', term);
    searchValue.value = '';
};
</script>

<style scoped lang="scss">
.hero-search {
    position: relative;
    min-height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: linear-gradient(135deg, #0f1419 0%, #1a2332 50%, #0f1419 100%);
    
    @media (max-width: 768px) {
        min-height: 80vh;
        padding: 2rem 1rem;
    }
}

.hero-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
}

.floating-particles {
    position: absolute;
    width: 100%;
    height: 100%;
    
    .particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(241, 183, 34, 0.6);
        border-radius: 50%;
        animation: float 8s infinite ease-in-out;
        
        &:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
        &:nth-child(2) { top: 80%; left: 20%; animation-delay: 1s; }
        &:nth-child(3) { top: 40%; left: 80%; animation-delay: 2s; }
        &:nth-child(4) { top: 60%; left: 70%; animation-delay: 3s; }
        &:nth-child(5) { top: 10%; left: 60%; animation-delay: 4s; }
        &:nth-child(6) { top: 90%; left: 80%; animation-delay: 5s; }
        &:nth-child(7) { top: 30%; left: 30%; animation-delay: 1.5s; }
        &:nth-child(8) { top: 70%; left: 50%; animation-delay: 2.5s; }
        &:nth-child(9) { top: 50%; left: 15%; animation-delay: 3.5s; }
        &:nth-child(10) { top: 25%; left: 85%; animation-delay: 4.5s; }
        &:nth-child(11) { top: 75%; left: 35%; animation-delay: 0.5s; }
        &:nth-child(12) { top: 15%; left: 45%; animation-delay: 6s; }
    }
}

.gradient-orbs {
    position: absolute;
    width: 100%;
    height: 100%;
    
    .orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(40px);
        animation: pulse 4s infinite ease-in-out;
        
        &.orb-1 {
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(241, 183, 34, 0.3) 0%, transparent 70%);
            top: 10%;
            right: 10%;
            animation-delay: 0s;
        }
        
        &.orb-2 {
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
            bottom: 20%;
            left: 15%;
            animation-delay: 2s;
        }
        
        &.orb-3 {
            width: 150px;
            height: 150px;
            background: radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%);
            top: 60%;
            right: 60%;
            animation-delay: 4s;
        }
    }
}

.hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    max-width: 900px;
    width: 100%;
    padding: 0 2rem;
    
    @media (max-width: 768px) {
        padding: 0 1rem;
    }
}

.hero-text {
    margin-bottom: 3rem;
    
    @media (max-width: 768px) {
        margin-bottom: 2rem;
    }
}

.hero-title {
    margin: 0 0 1.5rem 0;
    
    .title-main {
        display: block;
        font-size: 3.5rem;
        font-weight: 300;
        color: #ffffff;
        letter-spacing: -0.5px;
        
        @media (max-width: 768px) {
            font-size: 2.5rem;
        }
        
        @media (max-width: 480px) {
            font-size: 2rem;
        }
    }
    
    .title-accent {
        display: block;
        font-size: 4rem;
        font-weight: 700;
        background: linear-gradient(135deg, #f1b722 0%, #ffd700 50%, #f1b722 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-size: 200% 200%;
        animation: shimmer 3s ease-in-out infinite;
        
        @media (max-width: 768px) {
            font-size: 3rem;
        }
        
        @media (max-width: 480px) {
            font-size: 2.2rem;
        }
    }
}

.hero-subtitle {
    font-size: 1.3rem;
    color: #8ea9bd;
    font-weight: 300;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
    
    @media (max-width: 768px) {
        font-size: 1.1rem;
    }
    
    @media (max-width: 480px) {
        font-size: 1rem;
    }
}

.search-container {
    margin-bottom: 3rem;
}

.search-form {
    margin-bottom: 2rem;
}

.search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 50px;
    padding: 6px;
    box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.1);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(241, 183, 34, 0.3);
    }
    
    &:focus-within {
        transform: translateY(-3px);
        box-shadow: 
            0 30px 60px rgba(0, 0, 0, 0.4),
            0 0 0 2px rgba(241, 183, 34, 0.5);
    }
}

.search-icon-left {
    padding: 1rem 0 1rem 1.5rem;
    color: #666;
    
    svg {
        width: 24px;
        height: 24px;
    }
}

.search-input {
    flex: 1;
    padding: 1.25rem 1rem;
    border: none;
    background: transparent;
    font-size: 1.2rem;
    font-weight: 400;
    color: #333;
    outline: none;
    
    &::placeholder {
        color: #999;
        font-weight: 300;
    }
    
    @media (max-width: 768px) {
        font-size: 1rem;
        padding: 1rem 0.5rem;
    }
}

.search-submit {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #f1b722 0%, #e6a71a 100%);
    color: white;
    border: none;
    border-radius: 50px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    transform: scale(0.95);
    opacity: 0.7;
    
    &.active {
        transform: scale(1);
        opacity: 1;
        
        &:hover {
            transform: scale(1.05);
            background: linear-gradient(135deg, #e6a71a 0%, #d49b15 100%);
        }
    }
    
    &:disabled {
        cursor: not-allowed;
    }
    
    .submit-arrow {
        transition: transform 0.3s ease;
    }
    
    &:hover .submit-arrow {
        transform: translateX(3px);
    }
    
    @media (max-width: 768px) {
        padding: 0.875rem 1.5rem;
        font-size: 0.9rem;
        
        .submit-text {
            display: none;
        }
    }
}

.quick-suggestions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    opacity: 0.7;
    padding-top: 1rem;
    transition: all 0.3s ease;
    
    &.focused {
        opacity: 1;
        transform: translateY(-5px);
    }
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 0.5rem;
    }
}

.suggestions-label {
    color: #8ea9bd;
    font-size: 0.9rem;
    font-weight: 500;
    white-space: nowrap;
}

.suggestion-tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
}

.suggestion-tag {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    color: #ffffff;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        background: rgba(241, 183, 34, 0.2);
        border-color: rgba(241, 183, 34, 0.4);
        transform: translateY(-2px);
    }
}

.search-stats {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    opacity: 0.8;
    
    @media (max-width: 768px) {
        gap: 1rem;
    }
    
    @media (max-width: 480px) {
        flex-direction: column;
        gap: 0.5rem;
    }
}

.stat-item {
    text-align: center;
    
    .stat-number {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
        color: #f1b722;
        
        @media (max-width: 768px) {
            font-size: 1.2rem;
        }
    }
    
    .stat-label {
        display: block;
        font-size: 0.85rem;
        color: #8ea9bd;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-top: 0.25rem;
    }
}

.stat-divider {
    width: 1px;
    height: 40px;
    background: rgba(255, 255, 255, 0.2);
    
    @media (max-width: 480px) {
        width: 40px;
        height: 1px;
    }
}

.scroll-indicator {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    animation: bounce 2s infinite;
    
    .scroll-text {
        font-size: 0.85rem;
        color: #8ea9bd;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .scroll-arrow {
        color: #f1b722;
    }
}

@keyframes float {
    0%, 100% { 
        transform: translateY(0px) rotate(0deg); 
        opacity: 0.3;
    }
    50% { 
        transform: translateY(-20px) rotate(180deg); 
        opacity: 1;
    }
}

@keyframes pulse {
    0%, 100% { 
        transform: scale(1); 
        opacity: 0.3;
    }
    50% { 
        transform: scale(1.1); 
        opacity: 0.6;
    }
}

@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

@keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
    40% { transform: translateX(-50%) translateY(-10px); }
    60% { transform: translateX(-50%) translateY(-5px); }
}
</style>