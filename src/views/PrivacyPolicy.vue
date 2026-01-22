<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Politique de Confidentialité</h1>
        <p class="text-gray-600">Dernière mise à jour : {{ lastUpdated }}</p>
      </div>

      <!-- Table of Contents -->
      <div class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded mb-8">
        <h2 class="font-semibold text-blue-900 mb-3">Table des matières</h2>
        <ul class="space-y-1 text-sm text-blue-800">
          <li><a href="#intro" class="hover:underline">Introduction</a></li>
          <li><a href="#data-collection" class="hover:underline">Collecte de données</a></li>
          <li><a href="#ai-processing" class="hover:underline">Traitement par IA</a></li>
          <li><a href="#data-usage" class="hover:underline">Utilisation des données</a></li>
          <li><a href="#data-security" class="hover:underline">Sécurité des données</a></li>
          <li><a href="#user-rights" class="hover:underline">Droits des utilisateurs</a></li>
          <li><a href="#gdpr" class="hover:underline">Conformité RGPD</a></li>
          <li><a href="#ccpa" class="hover:underline">Conformité CCPA</a></li>
          <li><a href="#third-parties" class="hover:underline">Services tiers</a></li>
          <li><a href="#children" class="hover:underline">Enfants</a></li>
          <li><a href="#contact" class="hover:underline">Contact</a></li>
        </ul>
      </div>

      <!-- Content -->
      <div class="space-y-8 text-gray-700 leading-relaxed">
        <!-- 1. Introduction -->
        <section id="intro">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
          <p>
            Prospector AI ("Société", "nous", "notre") est engagée à protéger votre vie privée. Cette Politique de Confidentialité explique comment nous collectons, utilisons, divulguons et sauvegardons vos informations lorsque vous utilisez notre plateforme SaaS de campagnes téléphoniques alimentée par l'IA.
          </p>
          <p class="mt-4">
            Veuillez lire attentivement cette politique. Si vous n'acceptez pas nos pratiques, veuillez ne pas utiliser notre Service.
          </p>
        </section>

        <!-- 2. Collecte de données -->
        <section id="data-collection">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">2. Collecte de Données</h2>
          
          <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">2.1 Informations que vous nous fournissez</h3>
          <ul class="list-disc list-inside space-y-2 ml-2">
            <li><strong>Compte :</strong> Adresse email, mot de passe, nom, entreprise, secteur d'activité</li>
            <li><strong>Facturation :</strong> Adresse, numéro de carte bancaire (traité par PayPal - nous ne stockons pas directement)</li>
            <li><strong>Campagnes :</strong> Scripts de campagne, données de cibles, numéros de téléphone des destinataires</li>
            <li><strong>Profil :</strong> Préférences, paramètres, historique d'utilisation</li>
          </ul>

          <h3 class="text-lg font-semibold text-gray-800 mt-6 mb-2">2.2 Données collectées automatiquement</h3>
          <ul class="list-disc list-inside space-y-2 ml-2">
            <li><strong>Logs d'accès :</strong> Adresse IP, type de navigateur, système d'exploitation, pages visitées, temps d'accès</li>
            <li><strong>Cookies :</strong> Préférences de session, authentification, analyse de performance</li>
            <li><strong>Événements :</strong> Appels effectués, durée, résultats, interactions avec l'interface</li>
            <li><strong>Données de performance :</strong> Taux de réussite, engagement, métriques d'utilisation</li>
          </ul>

          <h3 class="text-lg font-semibold text-gray-800 mt-6 mb-2">2.3 Données générées par l'IA</h3>
          <ul class="list-disc list-inside space-y-2 ml-2">
            <li><strong>Transcriptions :</strong> Contenu audio converti en texte pour l'analyse</li>
            <li><strong>Enregistrements d'appels :</strong> Audio stocké pour la conformité et l'amélioration de la qualité</li>
            <li><strong>Analyses :</strong> Sentiment, émotion, classification des résultats générés par les modèles d'IA</li>
          </ul>
        </section>

        <!-- 3. Traitement par IA -->
        <section id="ai-processing">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">3. Traitement et Utilisations par l'IA</h2>
          
          <p class="mb-4">
            Notre plateforme utilise des modèles d'IA (fournis par Retell AI et autres partenaires) pour :
          </p>

          <h3 class="text-lg font-semibold text-gray-800 mb-2">3.1 Fonctionnalités principales</h3>
          <ul class="list-disc list-inside space-y-2 ml-2">
            <li>Générer et personnaliser des scripts d'appel basés sur vos campagnes</li>
            <li>Analyser les réponses et adapter les conversations en temps réel</li>
            <li>Transcrire et analyser les appels pour mesurer les performances</li>
            <li>Générer des rapports et insights sur vos campagnes</li>
          </ul>

          <h3 class="text-lg font-semibold text-gray-800 mt-6 mb-2">3.2 Données sensibles et conformité IA</h3>
          <p class="mb-2">
            <strong>⚠️ Avertissement Important :</strong> Conformément à la loi sur l'IA de l'UE (EU AI Act) et autres réglementations :
          </p>
          <ul class="list-disc list-inside space-y-2 ml-2 text-red-700">
            <li><strong>Ne transmettez JAMAIS :</strong> Numéros de sécurité sociale, numéros d'identification, informations biométriques, données médicales sans consentement explicite</li>
            <li><strong>Données raciales/ethniques :</strong> Leur utilisation dans les campagnes est prohibée dans de nombreuses juridictions</li>
            <li><strong>Données religieuses/politiques :</strong> Restrictions strictes dans l'UE, Californie et autres régions</li>
            <li><strong>Données génétiques :</strong> Interdites sauf consentement explicite et en conformité RGPD</li>
            <li><strong>Données de crédit :</strong> Soumises à des réglementations strictes (Fair Credit Reporting Act)</li>
          </ul>

          <h3 class="text-lg font-semibold text-gray-800 mt-6 mb-2">3.3 Entraînement et amélioration des modèles</h3>
          <p>
            Par défaut, vos données ne sont <strong>PAS</strong> utilisées pour entraîner nos modèles d'IA. Cependant :
          </p>
          <ul class="list-disc list-inside space-y-2 ml-2 mt-2">
            <li>Les données anonymisées et agrégées peuvent être utilisées pour améliorer la qualité du Service</li>
            <li>Vous pouvez refuser cette utilisation dans vos paramètres de confidentialité</li>
            <li>Les partenaires tiers (Retell AI) appliquent leurs propres politiques - consulter leurs CGU</li>
          </ul>
        </section>

        <!-- 4. Utilisation des données -->
        <section id="data-usage">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">4. Utilisation des Données</h2>
          <p class="mb-4">Nous utilisons vos données pour :</p>
          <ul class="list-disc list-inside space-y-2 ml-2">
            <li>Fournir et améliorer notre Service</li>
            <li>Traiter les paiements et gérer votre facturation</li>
            <li>Communiquer avec vous (support, mises à jour, alertes)</li>
            <li>Respecter les obligations légales et réglementaires</li>
            <li>Prévenir les fraudes et abus</li>
            <li>Générer des statistiques et rapports anonymisés</li>
            <li>Assurer la conformité légale (conservation d'enregistrements)</li>
          </ul>
        </section>

        <!-- 5. Sécurité -->
        <section id="data-security">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">5. Sécurité des Données</h2>
          <p class="mb-4">
            Nous mettons en œuvre des mesures de sécurité strictes :
          </p>
          <ul class="list-disc list-inside space-y-2 ml-2">
            <li><strong>Chiffrement :</strong> TLS/SSL pour les transmissions, AES-256 au repos</li>
            <li><strong>Authentification :</strong> Tokens JWT, hachage bcrypt, sessions sécurisées</li>
            <li><strong>Accès :</strong> Contrôle d'accès basé sur les rôles (RBAC), principe du moindre privilège</li>
            <li><strong>Audit :</strong> Journalisation de tous les accès administrateurs, webhooks signés</li>
            <li><strong>Infrastructure :</strong> Hébergement sécurisé (Vercel, Supabase - certifiés SOC 2)</li>
          </ul>
          <p class="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <strong>Important :</strong> Malgré nos efforts, aucune transmission sur internet n'est 100% sécurisée. Vous utilisez notre Service à vos propres risques.
          </p>
        </section>

        <!-- 6. Droits des utilisateurs -->
        <section id="user-rights">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">6. Vos Droits</h2>
          <p class="mb-4">Vous avez le droit de :</p>
          <ul class="list-disc list-inside space-y-2 ml-2">
            <li><strong>Accès :</strong> Demander une copie de vos données</li>
            <li><strong>Rectification :</strong> Corriger les données inexactes</li>
            <li><strong>Suppression :</strong> Demander la suppression de vos données (avec certaines exceptions légales)</li>
            <li><strong>Portabilité :</strong> Recevoir vos données dans un format lisible par machine</li>
            <li><strong>Opposition :</strong> Vous opposer au traitement de vos données pour certaines fins</li>
            <li><strong>Consentement :</strong> Retirer votre consentement à tout moment</li>
          </ul>
          <p class="mt-4">
            Pour exercer ces droits, contactez-nous à l'adresse indiquée à la section Contact.
          </p>
        </section>

        <!-- 7. RGPD -->
        <section id="gdpr">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">7. Conformité RGPD (UE)</h2>
          <p class="mb-4">
            Pour les utilisateurs de l'Union Européenne, nous nous conformons au Règlement Général sur la Protection des Données (RGPD) :
          </p>
          <ul class="list-disc list-inside space-y-2 ml-2">
            <li><strong>Base légale :</strong> Contrat, intérêt légitime, consentement, obligation légale</li>
            <li><strong>Délégué à la protection des données :</strong> Disponible sur demande</li>
            <li><strong>Transferts vers pays tiers :</strong> Utilisation de Clauses Contractuelles Types (CCT) pour les transferts sécurisés</li>
            <li><strong>Durée de conservation :</strong> Conservé aussi longtemps que nécessaire (généralement 3 ans, 5 ans pour les enregistrements d'appels si légalement requis)</li>
            <li><strong>Droit de recours :</strong> Vous pouvez former une réclamation auprès de votre autorité de protection des données locale</li>
          </ul>
        </section>

        <!-- 8. CCPA -->
        <section id="ccpa">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">8. Conformité CCPA (Californie)</h2>
          <p class="mb-4">
            Pour les résidents californiens (Consumer Privacy Act) :
          </p>
          <ul class="list-disc list-inside space-y-2 ml-2">
            <li><strong>Catégories de données :</strong> Identifiants, données commerciales, géolocalisation, données d'inférence</li>
            <li><strong>Vente ou partage :</strong> Nous ne vendons pas vos données personnelles. Certains services tiers peuvent constituer un "partage" selon la CCPA</li>
            <li><strong>Droits des consommateurs :</strong> Accès, suppression, opt-out de la vente/partage</li>
            <li><strong>Non-discrimination :</strong> Vous ne serez pas discriminés pour exercer vos droits CCPA</li>
          </ul>
          <p class="mt-4">
            Contactez-nous pour exercer vos droits CCPA.
          </p>
        </section>

        <!-- 9. Services tiers -->
        <section id="third-parties">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">9. Services Tiers et Partenaires</h2>
          <p class="mb-4">
            Nous partageons des données avec les services suivants :
          </p>

          <h3 class="text-lg font-semibold text-gray-800 mb-2">Fournisseurs essentiels :</h3>
          <ul class="list-disc list-inside space-y-2 ml-2">
            <li><strong>Retell AI :</strong> Fourni pour la génération et le traitement des appels par IA</li>
            <li><strong>Supabase :</strong> Base de données et authentification (SOC 2 certifié)</li>
            <li><strong>PayPal :</strong> Traitement des paiements (nous ne voyons pas vos données bancaires)</li>
            <li><strong>Vercel :</strong> Hébergement et déploiement (SOC 2 certifié)</li>
          </ul>

          <p class="mt-4 bg-blue-50 p-4 rounded">
            <strong>Important :</strong> Chaque partenaire tiers a sa propre politique de confidentialité. Nous vous encourageons à les consulter. Nous signons des accords de traitement des données (DPA) avec tous les processeurs.
          </p>
        </section>

        <!-- 10. Enfants -->
        <section id="children">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">10. Enfants</h2>
          <p>
            Notre Service est destiné aux entreprises et professionnels uniquement. Nous ne collectons pas intentionnellement des données d'enfants (moins de 13 ans). Si nous découvrons qu'un enfant a fourni des données, nous les supprimerons immédiatement. Les parents ou tuteurs légaux peuvent nous contacter pour signaler tout problème.
          </p>
        </section>

        <!-- 11. Modifications -->
        <section class="mt-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">11. Modifications de cette Politique</h2>
          <p>
            Nous pouvons modifier cette politique à tout moment. Les modifications importantes seront annoncées par email ou via une notification sur le Service. Votre utilisation continue du Service après modifications constitue votre acceptation.
          </p>
        </section>

        <!-- 12. Contact -->
        <section id="contact">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">12. Nous Contacter</h2>
          <p class="mb-4">
            Pour des questions concernant cette politique ou l'exercice de vos droits :
          </p>
          <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p class="font-semibold text-gray-900">📧 Email de Contact</p>
            <p class="mt-2">
              <a href="mailto:prospector.ai@gmail.com" class="text-blue-600 hover:underline font-semibold">
                prospector.ai@gmail.com
              </a>
            </p>
            <p class="text-sm text-gray-600 mt-3">
              Veuillez nous contacter directement pour toute question relative à la confidentialité ou pour exercer vos droits (accès, rectification, suppression, etc.).
            </p>
          </div>
        </section>
      </div>

      <!-- Footer -->
      <div class="mt-12 pt-8 border-t border-gray-200">
        <p class="text-center text-sm text-gray-600">
          © 2026 Prospector AI. Tous droits réservés.
        </p>
        <div class="flex justify-center gap-6 mt-4 text-sm">
          <router-link to="/terms-of-service" class="text-blue-600 hover:underline">
            Conditions d'utilisation
          </router-link>
          <router-link to="/account" class="text-blue-600 hover:underline">
            Mon Compte
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const lastUpdated = ref('22 Janvier 2026')
</script>
