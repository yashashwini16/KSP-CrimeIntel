"""Graph service — NoSQL edition. Builds criminal network from embedded accused data."""

from typing import Any

import networkx as nx

from models.nosql_models import Case
from schemas.network import EdgeSchema, GraphResponse, NodeSchema


class GraphService:
    async def build_graph(self, db: Any) -> nx.Graph:
        graph = nx.Graph()

        # Load all cases and build graph from embedded accused + co-accused links
        cases = await Case.get_all(limit=500)

        for case in cases:
            accused_list = case.accused_persons
            if not accused_list:
                continue

            # Add each accused as a node — use "caseid__idx" as stable ID
            node_ids = []
            for idx, accused in enumerate(accused_list):
                node_id = f"{case.ROWID}__{idx}"
                node_ids.append(node_id)
                if not graph.has_node(node_id):
                    graph.add_node(
                        node_id,
                        label=accused.get("name", "Unknown"),
                        age=accused.get("age"),
                        gender=accused.get("gender"),
                        risk_score=accused.get("risk_score", 0),
                        type="accused",
                    )

            # Connect co-accused persons in the same case
            for i in range(len(node_ids)):
                for j in range(i + 1, len(node_ids)):
                    graph.add_edge(
                        node_ids[i],
                        node_ids[j],
                        id=f"{node_ids[i]}-{node_ids[j]}",
                        link_type="co_accused",
                        weight=1.0,
                    )

        return graph

    def detect_communities(self, graph: nx.Graph) -> dict[str, int]:
        if graph.number_of_nodes() == 0:
            return {}
        try:
            communities = nx.community.louvain_communities(graph, seed=42)
        except Exception:  # noqa: BLE001
            try:
                communities = next(nx.community.girvan_newman(graph))
            except Exception:  # noqa: BLE001
                communities = nx.connected_components(graph)

        community_map: dict[str, int] = {}
        for community_id, nodes in enumerate(communities):
            for node in nodes:
                community_map[str(node)] = community_id
        return community_map

    def top_n_by_centrality(self, graph: nx.Graph, n: int = 200) -> list[str]:
        centrality = nx.degree_centrality(graph)
        return [
            str(node)
            for node, _score in sorted(
                centrality.items(), key=lambda item: -item[1]
            )[:n]
        ]

    def to_dict(self, graph: nx.Graph, communities: dict[str, int]) -> GraphResponse:
        selected_nodes = set(self.top_n_by_centrality(graph, 200))
        subgraph = graph.subgraph(selected_nodes)

        nodes = [
            NodeSchema(
                id=str(node),
                label=str(attrs.get("label") or node),
                community_id=communities.get(str(node), 0),
                risk_score=min(100, int(subgraph.degree(node) * 10)),
                metadata={
                    "degree": int(subgraph.degree(node)),
                    "age": attrs.get("age"),
                    "gender": attrs.get("gender"),
                },
            )
            for node, attrs in subgraph.nodes(data=True)
        ]
        edges = [
            EdgeSchema(
                id=str(attrs.get("id") or f"{source}-{target}"),
                source=str(source),
                target=str(target),
                link_type=str(attrs.get("link_type") or "association"),
                weight=float(attrs.get("weight") or 1.0),
                directed=False,
            )
            for source, target, attrs in subgraph.edges(data=True)
        ]
        return GraphResponse(nodes=nodes, edges=edges)
