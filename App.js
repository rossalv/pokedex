import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  SafeAreaView,
  View,
  StyleSheet,
  Image,
  FlatList,
  Button,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { Card } from "react-native-paper";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();
const windowWidth = Dimensions.get("window").width;

const TOTAL_POKEMON = 1025;

const typeColor = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

const fallbackColor = "#888888";

function getTypeColor(typeName) {
  return typeColor[typeName] || fallbackColor;
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Pokemon card for the grid
const SelectPokemon = ({ id }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("https://pokeapi.co/api/v2/pokemon/" + id)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((s) => {
        if (!cancelled) setData(s);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) return null;
  if (!data) {
    return (
      <View style={styles.loadingCard}>
        <ActivityIndicator size="small" color="#666" />
      </View>
    );
  }

  const primaryType = data.types[0].type.name;
  const typeLabel = data.types[1]
    ? capitalize(data.types[0].type.name) +
      " / " +
      capitalize(data.types[1].type.name)
    : capitalize(data.types[0].type.name);

  return (
    <View>
      <Card
        style={[styles.pokemonCard, { backgroundColor: getTypeColor(primaryType) }]}
      >
        <Image
          source={{
            uri: data.sprites.other["official-artwork"].front_default,
          }}
          style={{ width: windowWidth / 2.1, height: windowWidth / 2.1 }}
        />
        <Text style={styles.name}>#{data.id} {capitalize(data.name)}</Text>
        <Text style={styles.typeLabel}>{typeLabel}</Text>
      </Card>
    </View>
  );
};

// Home screen with Pokemon grid
const HomeScreen = ({ navigation }) => {
  const [text, setText] = useState("");

  const selectPokemons = React.useMemo(
    () =>
      [...Array(TOTAL_POKEMON).keys()].map((i) => ({
        i: i,
        navigation: navigation,
      })),
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("About", { id: item.i + 1 })
        }
      >
        <SelectPokemon id={item.i + 1} />
      </TouchableOpacity>
    ),
    [navigation]
  );

  const handleSearch = () => {
    const query = text.trim().toLowerCase();
    if (query) {
      navigation.navigate("Search", { id: query });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or number..."
          onChangeText={(newText) => setText(newText)}
          defaultValue={text}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={selectPokemons}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.i)}
        numColumns={2}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </SafeAreaView>
  );
};

// Search validation screen
const SearchComp = ({ navigation, route }) => {
  const [status, setStatus] = useState("loading"); // loading | found | not_found

  useEffect(() => {
    let cancelled = false;
    const query = route.params.id;
    if (!query || query === "") {
      setStatus("not_found");
      return;
    }

    fetch("https://pokeapi.co/api/v2/pokemon/" + query)
      .then((response) => {
        if (cancelled) return;
        if (response.ok) {
          return response.json();
        } else {
          setStatus("not_found");
        }
      })
      .then((data) => {
        if (cancelled || !data) return;
        // Navigate to About with the actual Pokemon ID
        navigation.replace("About", { id: data.id });
      })
      .catch(() => {
        if (!cancelled) setStatus("not_found");
      });

    return () => {
      cancelled = true;
    };
  }, [route.params.id, navigation]);

  if (status === "loading") {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#EE8130" />
        <Text style={styles.loadingText}>Searching...</Text>
      </View>
    );
  }

  return (
    <View style={styles.centerContainer}>
      <Text style={styles.notFoundText}>Pokemon Not Found</Text>
      <Text style={styles.notFoundSubtext}>
        No Pokemon matches "{route.params.id}"
      </Text>
      <View style={{ marginTop: 20 }}>
        <Button
          title="Search Again"
          onPress={() => navigation.goBack()}
          color="#EE8130"
        />
      </View>
    </View>
  );
};

// Pokemon detail screen
const AboutComp = ({ navigation, route }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch("https://pokeapi.co/api/v2/pokemon/" + route.params.id)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((pokemon) => {
        if (!cancelled) {
          setData(pokemon);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [route.params.id]);

  useEffect(() => {
    if (data) {
      navigation.setOptions({ title: capitalize(data.name) });
    }
  }, [data, navigation]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#EE8130" />
        <Text style={styles.loadingText}>Loading Pokemon...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.notFoundText}>Failed to load Pokemon</Text>
        <View style={{ marginTop: 20 }}>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            color="#EE8130"
          />
        </View>
      </View>
    );
  }

  const primaryType = data.types[0].type.name;
  const bgColor = getTypeColor(primaryType);
  const typeLabel = data.types
    .map((t) => capitalize(t.type.name))
    .join(" / ");
  const artworkUrl =
    data.sprites.other["official-artwork"].front_default ||
    data.sprites.front_default;

  return (
    <FlatList
      data={[{ key: "detail" }]}
      renderItem={() => (
        <View style={styles.aboutContainer}>
          {/* Header with artwork */}
          <View style={[styles.aboutHeader, { backgroundColor: bgColor }]}>
            <Image
              source={{ uri: artworkUrl }}
              style={styles.aboutImage}
            />
            <Text style={styles.aboutName}>
              #{data.id} {capitalize(data.name)}
            </Text>
            <Text style={styles.aboutType}>{typeLabel}</Text>
          </View>

          {/* Info section */}
          <View style={styles.aboutInfo}>
            <Text style={styles.sectionTitle}>Info</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Height</Text>
                <Text style={styles.infoValue}>{(data.height / 10).toFixed(1)} m</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Weight</Text>
                <Text style={styles.infoValue}>{(data.weight / 10).toFixed(1)} kg</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Base Exp</Text>
                <Text style={styles.infoValue}>{data.base_experience ?? "—"}</Text>
              </View>
            </View>

            {/* Abilities */}
            <Text style={styles.sectionTitle}>Abilities</Text>
            <View style={styles.abilitiesRow}>
              {data.abilities.map((a, idx) => (
                <View
                  key={idx}
                  style={[styles.abilityBadge, { backgroundColor: bgColor }]}
                >
                  <Text style={styles.abilityText}>
                    {capitalize(a.ability.name.replace("-", " "))}
                    {a.is_hidden ? " (Hidden)" : ""}
                  </Text>
                </View>
              ))}
            </View>

            {/* Stats */}
            <Text style={styles.sectionTitle}>Base Stats</Text>
            {data.stats.map((stat, idx) => {
              const statName = stat.stat.name
                .replace("special-attack", "Sp. Atk")
                .replace("special-defense", "Sp. Def")
                .replace("hp", "HP")
                .replace("attack", "Attack")
                .replace("defense", "Defense")
                .replace("speed", "Speed");
              const maxStat = 255;
              const pct = (stat.base_stat / maxStat) * 100;
              return (
                <View key={idx} style={styles.statRow}>
                  <Text style={styles.statName}>{statName}</Text>
                  <Text style={styles.statValue}>{stat.base_stat}</Text>
                  <View style={styles.statBarBg}>
                    <View
                      style={[
                        styles.statBarFill,
                        {
                          width: pct + "%",
                          backgroundColor:
                            stat.base_stat >= 100 ? "#4CAF50" : stat.base_stat >= 50 ? "#FFC107" : "#F44336",
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}

            {/* Moves preview */}
            <Text style={styles.sectionTitle}>
              Moves ({data.moves.length})
            </Text>
            <View style={styles.movesContainer}>
              {data.moves.slice(0, 12).map((m, idx) => (
                <View key={idx} style={styles.moveBadge}>
                  <Text style={styles.moveText}>
                    {capitalize(m.move.name.replace("-", " "))}
                  </Text>
                </View>
              ))}
              {data.moves.length > 12 && (
                <View style={styles.moveBadge}>
                  <Text style={styles.moveText}>
                    +{data.moves.length - 12} more
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Navigation buttons */}
          <View style={styles.aboutButtons}>
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: bgColor }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.navButtonText}>Go Back</Text>
            </TouchableOpacity>
            {data.id > 1 && (
              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: "#555" }]}
                onPress={() =>
                  navigation.replace("About", { id: data.id - 1 })
                }
              >
                <Text style={styles.navButtonText}>Prev</Text>
              </TouchableOpacity>
            )}
            {data.id < TOTAL_POKEMON && (
              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: "#555" }]}
                onPress={() =>
                  navigation.replace("About", { id: data.id + 1 })
                }
              >
                <Text style={styles.navButtonText}>Next</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    />
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "Pokedex",
            headerStyle: { backgroundColor: "#EE8130" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold", fontSize: 22 },
          }}
        />
        <Stack.Screen
          name="About"
          component={AboutComp}
          options={{
            title: "Pokemon Details",
            headerStyle: { backgroundColor: "#EE8130" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="Search"
          component={SearchComp}
          options={{
            title: "Search",
            headerStyle: { backgroundColor: "#EE8130" },
            headerTintColor: "#fff",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchRow: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  searchInput: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: "#EE8130",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  pokemonCard: {
    paddingLeft: 3,
    margin: 3,
    borderRadius: 16,
    overflow: "hidden",
  },
  name: {
    fontSize: 15,
    fontWeight: "bold",
    textTransform: "capitalize",
    textAlign: "center",
    color: "#fff",
    paddingTop: 4,
  },
  typeLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "bold",
    textAlign: "center",
    paddingBottom: 8,
  },
  loadingCard: {
    width: windowWidth / 2.1,
    height: windowWidth / 2.1 + 50,
    margin: 3,
    borderRadius: 16,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  notFoundText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  notFoundSubtext: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  // About screen styles
  aboutContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  aboutHeader: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  aboutImage: {
    width: 250,
    height: 250,
  },
  aboutName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textTransform: "capitalize",
    marginTop: 8,
  },
  aboutType: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
    marginTop: 4,
  },
  aboutInfo: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 13,
    color: "#888",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  abilitiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  abilityBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  abilityText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statName: {
    width: 70,
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  statValue: {
    width: 35,
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
    marginRight: 10,
  },
  statBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  statBarFill: {
    height: 8,
    borderRadius: 4,
  },
  movesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  moveBadge: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  moveText: {
    fontSize: 13,
    color: "#555",
  },
  aboutButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    padding: 20,
    paddingBottom: 40,
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  navButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
