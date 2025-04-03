import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  ImageBackground,
} from "react-native";
import {
  Anchor,
  Boat,
  MapPin,
  Settings,
  Compass,
  TrendingUp,
  Bell,
  User,
} from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";

// Card personalizzata con effetti di ombreggiatura e gradiente
const FeatureCard = ({ title, description, icon, colors, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.cardContainer}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardAction}>Apri</Text>
          <View style={styles.arrowContainer}>
            <Text style={styles.arrowIcon}>→</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Componente per visualizzare statistiche sintetiche
const StatCard = ({ title, value, icon, color }) => {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIconContainer}>{icon}</View>
      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
};

const HomePage = ({ navigation }) => {
  // Dati di esempio per le statistiche
  const stats = [
    {
      title: "Barche ormeggiate",
      value: "42",
      icon: <Boat width={24} height={24} color="#3b82f6" />,
      color: "#3b82f6",
    },
    {
      title: "Posti disponibili",
      value: "18",
      icon: <Anchor width={24} height={24} color="#10b981" />,
      color: "#10b981",
    },
    {
      title: "Ormeggi prenotati",
      value: "7",
      icon: <Compass width={24} height={24} color="#f59e0b" />,
      color: "#f59e0b",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header con sfondo immagine */}
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1518433583507-5a99c1a95065",
        }}
        style={styles.headerImage}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.7)"]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <Text style={styles.headerTitle}>Porto Nautico</Text>
              <View style={styles.headerIcons}>
                <TouchableOpacity style={styles.iconButton}>
                  <Bell width={24} height={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <User width={24} height={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>Gestione Moli</Text>
          </View>
        </LinearGradient>
      </ImageBackground>

      {/* Contenuto principale */}
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Sezione statistiche */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Funzionalità Principali</Text>

        {/* Griglia di card */}
        <View style={styles.cardsGrid}>
          <FeatureCard
            title="Monitora Molo"
            description="Visualizza lo stato dei moli in tempo reale con statistiche dettagliate"
            icon={<Anchor width={28} height={28} color="#fff" />}
            colors={["#3b82f6", "#1d4ed8"]}
            onPress={() => navigation.navigate("MonitoraMolo")}
          />

          <FeatureCard
            title="Monitora Barche"
            description="Controlla posizione e stato di tutte le imbarcazioni ormeggiate"
            icon={<Boat width={28} height={28} color="#fff" />}
            colors={["#10b981", "#065f46"]}
            onPress={() => navigation.navigate("MonitoraBarche")}
          />

          <FeatureCard
            title="Modifica Moli"
            description="Configura e gestisci i tuoi moli e i relativi posti barca"
            icon={<Settings width={28} height={28} color="#fff" />}
            colors={["#f59e0b", "#b45309"]}
            onPress={() => navigation.navigate("ModificaMoli")}
          />

          <FeatureCard
            title="Statistiche"
            description="Analizza l'andamento delle prenotazioni e ottimizza la gestione"
            icon={<TrendingUp width={28} height={28} color="#fff" />}
            colors={["#8b5cf6", "#4c1d95"]}
            onPress={() => navigation.navigate("Statistiche")}
          />
        </View>

        {/* Sezione attività recenti */}
        <View style={styles.recentActivityContainer}>
          <Text style={styles.sectionTitle}>Attività Recenti</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View
                style={[styles.activityDot, { backgroundColor: "#10b981" }]}
              />
              <Text style={styles.activityText}>
                <Text style={styles.activityHighlight}>Barca "Serenity"</Text>{" "}
                ormeggiata al molo 3
              </Text>
              <Text style={styles.activityTime}>2 ore fa</Text>
            </View>

            <View style={styles.activityItem}>
              <View
                style={[styles.activityDot, { backgroundColor: "#f59e0b" }]}
              />
              <Text style={styles.activityText}>
                <Text style={styles.activityHighlight}>Manutenzione</Text>{" "}
                completata al molo 1
              </Text>
              <Text style={styles.activityTime}>Ieri</Text>
            </View>

            <View style={styles.activityItem}>
              <View
                style={[styles.activityDot, { backgroundColor: "#3b82f6" }]}
              />
              <Text style={styles.activityText}>
                <Text style={styles.activityHighlight}>
                  5 nuove prenotazioni
                </Text>{" "}
                per il weekend
              </Text>
              <Text style={styles.activityTime}>2 giorni fa</Text>
            </View>
          </View>
        </View>

        {/* Padding bottom per scroll */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  headerImage: {
    height: 200,
  },
  headerGradient: {
    height: "100%",
  },
  headerContent: {
    padding: 20,
    height: "100%",
    justifyContent: "space-between",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 5,
  },
  headerIcons: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#f5f7fa",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingTop: 16,
  },
  statCard: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 16,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  cardContainer: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardGradient: {
    padding: 16,
    height: 160,
    justifyContent: "space-between",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardAction: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
  },
  arrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: {
    color: "white",
    fontSize: 16,
  },
  recentActivityContainer: {
    marginBottom: 20,
  },
  activityCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityItem: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    alignItems: "center",
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
  },
  activityHighlight: {
    fontWeight: "bold",
    color: "#0f172a",
  },
  activityTime: {
    fontSize: 12,
    color: "#94a3b8",
  },
});

export default HomePage;
