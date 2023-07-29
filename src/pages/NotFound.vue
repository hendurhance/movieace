<template>
    <div class="not-found">
      <h1 class="not-found-title">Not Found</h1>
      <div class="icon-container">
        <div class="icon">
          🙄
        </div>
      </div>
      <div class="navigate">
        <router-link to="/">Go Home</router-link>
      </div>
    </div>
</template>
  

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
    name: 'NotFound',
});
</script>

<style scoped lang="scss">
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color:hsla(203,65%,9%,1);
    background-image:
    radial-gradient(at 40% 44%, hsla(21,81%,61%,1) 0px, transparent 50%),
    radial-gradient(at 53% 93%, hsla(233,71%,70%,1) 0px, transparent 50%),
    radial-gradient(at 95% 63%, hsla(322,92%,61%,1) 0px, transparent 50%),
    radial-gradient(at 46% 99%, hsla(72,98%,78%,1) 0px, transparent 50%),
    radial-gradient(at 36% 46%, hsla(251,82%,74%,1) 0px, transparent 50%),
    radial-gradient(at 48% 76%, hsla(105,71%,79%,1) 0px, transparent 50%),
    radial-gradient(at 43% 8%, hsla(288,74%,60%,1) 0px, transparent 50%);

  .not-found-title {
    font-size: 4rem;
    font-weight: bold;
    color: #fff;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  }

  .icon-container {
    animation: bounce 2s infinite;
  }

  .icon {
    font-size: 8rem;
    color: #fff;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  }

  .navigate {
    margin-top: 20px;
    a {
      color: #fff;
      font-size: 1.2rem;
      font-weight: bold;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      background-color: #0c2738;
      transition: all 0.3s ease-in-out;
      &:hover {
        background-color: #0c202b;
      }
    }
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-30px);
    }
    60% {
      transform: translateY(-15px);
    }
  }
}
</style>
