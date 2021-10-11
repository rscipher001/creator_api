<template>
  <section class="hero is-fullheight-with-navbar is-light">
    <div class="hero-body container">
      <div class="card p-5">
        <h1 class="is-size-4 has-text-centered pb-5">
          <span v-if="isTokenValid">Email verified successfully</span>
          <span v-if="loading.emailVerify && !isTokenValid"
            >Email token expired, please request new email</span
          >
        </h1>
        <b-button
          class="is-fullwidth mt-2"
          tag="router-link"
          to="/login"
          type="is-primary"
        >
          Back to Login?
        </b-button>
      </div>
    </div>
  </section>
</template>

<script>
import { mapState, mapActions } from "vuex";
import ValidationException from "@/exceptions/ValidationException";

export default {
  name: "VerifyEmail",

  mounted() {
    const params = new URLSearchParams(window.location.search);
    this.form.email = params.get("email");
    this.form.token = params.get("token");
    this.verifyEmail();
  },

  data() {
    return {
      isTokenValid: false,
      errors: {},
      form: {
        email: "",
        token: "",
      },
    };
  },

  methods: {
    ...mapActions("auth", {
      verifyEmailAction: "verifyEmail",
      refreshUser: "refreshUser",
    }),

    async verifyEmail() {
      try {
        await this.verifyEmailAction({
          token: this.form.token,
          email: this.form.email,
        });
        this.isTokenValid = true;
        await this.refreshUser();
      } catch (e) {
        console.error(e);
        let message = "Reset token not valid";
        if (e instanceof ValidationException) {
          this.errors = e.errors;
          message = "Validation Error";
        }
        this.$buefy.toast.open({
          message,
          type: "is-danger",
          position: "is-bottom-right",
          duration: 10000,
        });
      }
    },
  },

  computed: mapState("auth", {
    user: (state) => state.user,
    loading: (state) => state.loading,
  }),
};
</script>
