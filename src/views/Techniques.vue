<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-6">
      <!-- Hero Section -->
      <Card class="mb-8 shadow-lg border border-gray-200">
        <template #content>
          <div class="text-center py-8">
            <h1 class="text-5xl font-bold text-gray-900 mb-4">
              Techniques de Prospection Avancées
            </h1>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              Notre agent vocal AI maîtrise les techniques les plus efficaces de prospection commerciale pour maximiser vos résultats
            </p>
          </div>
        </template>
      </Card>

      <!-- Techniques Section -->
      <div class="mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-6 text-center">Les Techniques Maîtrisées</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Cold Call 2.0 -->
          <Card class="shadow-md border border-gray-200 hover:shadow-xl transition-shadow">
            <template #title>
              <div class="flex items-center gap-3">
                <i class="pi pi-phone text-2xl text-gray-700"></i>
                <span class="text-xl font-bold text-gray-900">Cold Call 2.0</span>
              </div>
            </template>
            <template #content>
              <div class="space-y-3">
                <p class="text-gray-700 leading-relaxed">
                  <strong>Pattern Interrupt + Permission-Based Opening</strong>
                </p>
                <p class="text-gray-600">
                  Cette technique moderne rompt les schémas de communication traditionnels en créant une interruption positive qui capture l'attention du prospect dès les premières secondes.
                </p>
                <div class="bg-gray-100 p-4 rounded-lg mt-4">
                  <p class="text-sm font-semibold text-gray-900 mb-2">Comment ça fonctionne :</p>
                  <ul class="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Interruption du pattern habituel de communication</li>
                    <li>Demande de permission avant de continuer</li>
                    <li>Création d'une connexion immédiate</li>
                    <li>Augmentation du taux d'engagement</li>
                  </ul>
                </div>
              </div>
            </template>
          </Card>

          <!-- SPIN Selling -->
          <Card class="shadow-md border border-gray-200 hover:shadow-xl transition-shadow">
            <template #title>
              <div class="flex items-center gap-3">
                <i class="pi pi-question-circle text-2xl text-gray-700"></i>
                <span class="text-xl font-bold text-gray-900">SPIN Selling</span>
              </div>
            </template>
            <template #content>
              <div class="space-y-3">
                <p class="text-gray-700 leading-relaxed">
                  <strong>Situation → Problem → Implication → Need-Payoff</strong>
                </p>
                <p class="text-gray-600">
                  Méthode structurée en 4 étapes pour identifier les besoins réels du prospect et construire une proposition de valeur personnalisée.
                </p>
                <div class="bg-gray-100 p-4 rounded-lg mt-4">
                  <p class="text-sm font-semibold text-gray-900 mb-2">Les 4 étapes :</p>
                  <ul class="text-sm text-gray-700 space-y-1">
                    <li><strong>Situation :</strong> Comprendre le contexte actuel</li>
                    <li><strong>Problem :</strong> Identifier les problèmes existants</li>
                    <li><strong>Implication :</strong> Explorer les conséquences</li>
                    <li><strong>Need-Payoff :</strong> Présenter la solution</li>
                  </ul>
                </div>
              </div>
            </template>
          </Card>

          <!-- NEPQ -->
          <Card class="shadow-md border border-gray-200 hover:shadow-xl transition-shadow">
            <template #title>
              <div class="flex items-center gap-3">
                <i class="pi pi-users text-2xl text-gray-700"></i>
                <span class="text-xl font-bold text-gray-900">NEPQ</span>
              </div>
            </template>
            <template #content>
              <div class="space-y-3">
                <p class="text-gray-700 leading-relaxed">
                  <strong>Neutrality → Emotion → Problem → Qualifier</strong>
                </p>
                <p class="text-gray-600">
                  Approche psychologique qui guide le prospect à travers un parcours émotionnel structuré, de la neutralité initiale à la qualification finale.
                </p>
                <div class="bg-gray-100 p-4 rounded-lg mt-4">
                  <p class="text-sm font-semibold text-gray-900 mb-2">Le processus :</p>
                  <ul class="text-sm text-gray-700 space-y-1">
                    <li><strong>Neutrality :</strong> Établir un contact neutre et professionnel</li>
                    <li><strong>Emotion :</strong> Créer une connexion émotionnelle</li>
                    <li><strong>Problem :</strong> Identifier les défis spécifiques</li>
                    <li><strong>Qualifier :</strong> Valider l'adéquation de la solution</li>
                  </ul>
                </div>
              </div>
            </template>
          </Card>

          <!-- BANT -->
          <Card class="shadow-md border border-gray-200 hover:shadow-xl transition-shadow">
            <template #title>
              <div class="flex items-center gap-3">
                <i class="pi pi-check-circle text-2xl text-gray-700"></i>
                <span class="text-xl font-bold text-gray-900">BANT</span>
              </div>
            </template>
            <template #content>
              <div class="space-y-3">
                <p class="text-gray-700 leading-relaxed">
                  <strong>Budget → Authority → Need → Timing</strong>
                </p>
                <p class="text-gray-600">
                  Framework de qualification qui permet d'évaluer rapidement si un prospect est prêt et capable d'acheter, optimisant ainsi le temps de prospection.
                </p>
                <div class="bg-gray-100 p-4 rounded-lg mt-4">
                  <p class="text-sm font-semibold text-gray-900 mb-2">Les critères :</p>
                  <ul class="text-sm text-gray-700 space-y-1">
                    <li><strong>Budget :</strong> Capacité financière à investir</li>
                    <li><strong>Authority :</strong> Pouvoir de décision</li>
                    <li><strong>Need :</strong> Besoin réel et urgent</li>
                    <li><strong>Timing :</strong> Délai de décision</li>
                  </ul>
                </div>
              </div>
            </template>
          </Card>

          <!-- Feel-Felt-Found -->
          <Card class="shadow-md border border-gray-200 hover:shadow-xl transition-shadow">
            <template #title>
              <div class="flex items-center gap-3">
                <i class="pi pi-heart text-2xl text-gray-700"></i>
                <span class="text-xl font-bold text-gray-900">Feel-Felt-Found</span>
              </div>
            </template>
            <template #content>
              <div class="space-y-3">
                <p class="text-gray-700 leading-relaxed">
                  <strong>"Je comprends (feel) → D'autres ont ressenti (felt) → Ils ont trouvé (found)"</strong>
                </p>
                <p class="text-gray-600">
                  Technique d'empathie et de preuve sociale qui rassure le prospect en montrant que ses préoccupations sont normales et que d'autres ont trouvé une solution.
                </p>
                <div class="bg-gray-100 p-4 rounded-lg mt-4">
                  <p class="text-sm font-semibold text-gray-900 mb-2">La structure :</p>
                  <ul class="text-sm text-gray-700 space-y-1">
                    <li><strong>Feel :</strong> Reconnaître et valider les émotions</li>
                    <li><strong>Felt :</strong> Partager des expériences similaires</li>
                    <li><strong>Found :</strong> Présenter la solution qui a fonctionné</li>
                  </ul>
                </div>
              </div>
            </template>
          </Card>

          <!-- S.A.F.E. -->
          <Card class="shadow-md border border-gray-200 hover:shadow-xl transition-shadow">
            <template #title>
              <div class="flex items-center gap-3">
                <i class="pi pi-shield text-2xl text-gray-700"></i>
                <span class="text-xl font-bold text-gray-900">S.A.F.E.</span>
              </div>
            </template>
            <template #content>
              <div class="space-y-3">
                <p class="text-gray-700 leading-relaxed">
                  <strong>Stop → Acknowledge → Fix → Engage</strong>
                </p>
                <p class="text-gray-600">
                  Méthode de gestion des objections qui transforme les résistances en opportunités en créant un dialogue constructif et orienté solution.
                </p>
                <div class="bg-gray-100 p-4 rounded-lg mt-4">
                  <p class="text-sm font-semibold text-gray-900 mb-2">Les étapes :</p>
                  <ul class="text-sm text-gray-700 space-y-1">
                    <li><strong>Stop :</strong> Arrêter et écouter l'objection</li>
                    <li><strong>Acknowledge :</strong> Reconnaître la préoccupation</li>
                    <li><strong>Fix :</strong> Proposer une solution adaptée</li>
                    <li><strong>Engage :</strong> Engager vers l'action suivante</li>
                  </ul>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>

      <!-- Problems Section -->
      <Card class="mb-12 shadow-lg border border-gray-200 bg-gray-900 text-white">
        <template #content>
          <div class="py-8">
            <h2 class="text-3xl font-bold mb-6 text-center">Les Problèmes des Entreprises</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <i class="pi pi-times-circle text-2xl text-red-400 mt-1"></i>
                  <div>
                    <h3 class="font-bold text-lg mb-2">Taux de réponse faible</h3>
                    <p class="text-gray-300">Les emails et appels manuels génèrent des taux de réponse très bas, gaspillant du temps et des ressources précieuses.</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <i class="pi pi-clock text-2xl text-yellow-400 mt-1"></i>
                  <div>
                    <h3 class="font-bold text-lg mb-2">Manque de temps</h3>
                    <p class="text-gray-300">Les équipes commerciales passent trop de temps sur des tâches répétitives au lieu de se concentrer sur la conversion.</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <i class="pi pi-exclamation-triangle text-2xl text-orange-400 mt-1"></i>
                  <div>
                    <h3 class="font-bold text-lg mb-2">Inconsistance des approches</h3>
                    <p class="text-gray-300">Chaque commercial utilise sa propre méthode, créant des résultats incohérents et difficiles à mesurer.</p>
                  </div>
                </div>
              </div>
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <i class="pi pi-dollar text-2xl text-red-400 mt-1"></i>
                  <div>
                    <h3 class="font-bold text-lg mb-2">Coûts élevés</h3>
                    <p class="text-gray-300">L'embauche et la formation d'équipes commerciales représentent un investissement considérable avec un ROI incertain.</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <i class="pi pi-chart-line text-2xl text-yellow-400 mt-1"></i>
                  <div>
                    <h3 class="font-bold text-lg mb-2">Difficulté de scalabilité</h3>
                    <p class="text-gray-300">Augmenter le volume de prospection nécessite d'embaucher plus de personnel, ce qui n'est pas toujours viable.</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <i class="pi pi-ban text-2xl text-orange-400 mt-1"></i>
                  <div>
                    <h3 class="font-bold text-lg mb-2">Fatigue et rejet</h3>
                    <p class="text-gray-300">Les refus répétés et la fatigue mentale affectent la motivation et les performances des équipes commerciales.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Solution Section -->
      <Card class="mb-8 shadow-xl border-2 border-gray-900">
        <template #content>
          <div class="py-10">
            <div class="text-center mb-8">
              <h2 class="text-4xl font-bold text-gray-900 mb-4">La Solution Ultime</h2>
              <p class="text-2xl text-gray-700 font-semibold">Agent Vocal AI Spécialisé en Prospection</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div class="text-center p-6 bg-gray-50 rounded-lg">
                <i class="pi pi-robot text-5xl text-gray-900 mb-4"></i>
                <h3 class="text-xl font-bold text-gray-900 mb-3">IA Avancée</h3>
                <p class="text-gray-600">Notre agent utilise l'intelligence artificielle la plus récente pour comprendre le contexte et adapter sa communication en temps réel.</p>
              </div>
              <div class="text-center p-6 bg-gray-50 rounded-lg">
                <i class="pi pi-bolt text-5xl text-gray-900 mb-4"></i>
                <h3 class="text-xl font-bold text-gray-900 mb-3">24/7 Disponible</h3>
                <p class="text-gray-600">Travaillez sans interruption. L'agent peut prospecter à toute heure, maximisant vos opportunités de contact.</p>
              </div>
              <div class="text-center p-6 bg-gray-50 rounded-lg">
                <i class="pi pi-chart-bar text-5xl text-gray-900 mb-4"></i>
                <h3 class="text-xl font-bold text-gray-900 mb-3">Scalable à l'infini</h3>
                <p class="text-gray-600">Passez de 10 à 10 000 appels par jour sans augmenter vos coûts fixes. La scalabilité devient votre avantage concurrentiel.</p>
              </div>
            </div>

            <Divider />

            <div class="mt-8">
              <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">Pourquoi Notre Agent Vocal AI est la Solution</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                    <div>
                      <h4 class="font-bold text-lg text-gray-900 mb-2">Maîtrise Parfaite des Techniques</h4>
                      <p class="text-gray-600">Notre agent combine toutes les techniques avancées (Cold Call 2.0, SPIN, NEPQ, BANT, Feel-Felt-Found, S.A.F.E.) pour maximiser chaque interaction.</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                    <div>
                      <h4 class="font-bold text-lg text-gray-900 mb-2">Cohérence et Qualité</h4>
                      <p class="text-gray-600">Chaque appel suit le même niveau d'excellence, garantissant une expérience professionnelle constante pour vos prospects.</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                    <div>
                      <h4 class="font-bold text-lg text-gray-900 mb-2">Analyse en Temps Réel</h4>
                      <p class="text-gray-600">L'agent analyse les réponses, détecte les signaux d'intérêt et adapte sa stratégie instantanément pour optimiser les résultats.</p>
                    </div>
                  </div>
                </div>
                <div class="space-y-4">
                  <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
                    <div>
                      <h4 class="font-bold text-lg text-gray-900 mb-2">Rapports Détaillés</h4>
                      <p class="text-gray-600">Recevez des données précises sur chaque appel : notes, niveau d'intérêt, prochaines actions, permettant un suivi optimal.</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">5</div>
                    <div>
                      <h4 class="font-bold text-lg text-gray-900 mb-2">ROI Mesurable</h4>
                      <p class="text-gray-600">Réduction drastique des coûts par contact, augmentation du taux de qualification, et amélioration continue grâce aux données.</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">6</div>
                    <div>
                      <h4 class="font-bold text-lg text-gray-900 mb-2">Pas de Fatigue</h4>
                      <p class="text-gray-600">L'agent ne connaît pas la fatigue, le stress ou les émotions négatives. Chaque appel est traité avec la même énergie et professionnalisme.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-10 text-center">
              <Button
                label="Créer une Campagne"
                icon="pi pi-arrow-right"
                size="large"
                @click="$router.push('/campaign')"
                class="px-8 py-3 text-lg"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import Card from 'primevue/card'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
</script>

<style scoped>
</style>

