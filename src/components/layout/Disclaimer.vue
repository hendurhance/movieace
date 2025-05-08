<template>
    <div class="disclaimer-container">
        <div class="disclaimer-icon">
            <InfoIcon />
        </div>
        <div class="disclaimer-content">
            <h3>Important Notice</h3>
        <p>
            MovieAce does not host, store, or provide any video content. Our service simply embeds and 
            indexes media that is already publicly available on third-party platforms. All movies and TV shows 
            displayed are hosted elsewhere and embedded here for convenience. We have no control over and do not 
            assume responsibility for the content, privacy policies, or practices of any third-party websites or sources.
        </p>
        <p class="notice-text">
            All copyrighted content belongs to their rightful owners. If you believe content accessible via our service 
            infringes your copyright, please contact the source website directly.
        </p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import InfoIcon from '../svg/solid/info.vue';

export default defineComponent({
name: 'Disclaimer',
components: {
    InfoIcon
}
});
</script>

<style lang="scss" scoped>
.disclaimer-container {
display: flex;
gap: 1.5rem;
padding: 1.5rem;
background: linear-gradient(to right, rgba(12, 39, 56, 0.9), rgba(8, 27, 39, 0.9));
color: #d0d0d0;
border-radius: 12px;
margin: 2rem auto;
max-width: 1000px;
border-left: 4px solid #4EB5FF;
box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
backdrop-filter: blur(10px);

@media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem;
    align-items: center;
    text-align: center;
}

.disclaimer-icon {
    flex-shrink: 0;
    display: flex;
    align-items: flex-start;
    padding-top: 0.5rem;
    
    svg {
    width: 32px;
    height: 32px;
    }
    
    @media (max-width: 768px) {
    padding-top: 0;
    }
}

.disclaimer-content {
    flex: 1;
    
    h3 {
    margin: 0 0 0.75rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #fff;
    }
    
    p {
    margin: 0 0 1rem 0;
    font-size: 0.95rem;
    line-height: 1.6;
    
    &:last-child {
        margin-bottom: 0;
    }
    }
    
    .notice-text {
    font-size: 0.9rem;
    color: #4EB5FF;
    font-style: italic;
    }
}
}
</style>