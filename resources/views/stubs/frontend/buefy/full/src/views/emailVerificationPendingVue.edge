<template>
  <section>
    <div
      class="container is-max-desktop has-text-centered"
      style="margin-top: 72px"
    >
      <h1 class="is-size-4 has-text-weight-bold has-text-primary">
        Email verification is pending
      </h1>
      <p class="mt-2">Please check your inbox or spam folder</p>
      <div class="mb-6 mt-3 buttons is-centered">
        <b-button
          @click="resendVerificationEmail"
          type="is-primary"
          :is-loading="loading.resendVerificationEmail"
          >Resend Verification Email</b-button
        >
      </div>
      <div>
        <img
          style="max-width: 480px"
          src="@/assets/programming.svg"
          alt="Programmer with code illustration"
        />
      </div>
    </div>
  </section>
</template>

<script>
import { mapState, mapActions } from "vuex";
import ValidationException from "@/exceptions/ValidationException";

export default {
  name: "EmailVerificationPending",

  methods: {
    ...mapActions("auth", {
      resendVerificationEmailAction: "resendVerificationEmail",
    }),

    async resendVerificationEmail() {
      try {
        await this.resendVerificationEmailAction({
          email: this.user.email,
        });
        this.$buefy.toast.open({
          message: "Email verification mail sent successfully!",
          type: "is-success",
          position: "is-bottom-right",
        });
        this.$router.push("/project");
      } catch (e) {
        let message = "Unable to send verification email";
        if (e instanceof ValidationException) {
          this.errors = e.errors;
          message = "Validation Error";
        }
        this.$buefy.toast.open({
          message,
          type: "is-danger",
          position: "is-bottom-right",
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
