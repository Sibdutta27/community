import type {
  ProfileLineageTreeData,
  ProfileLineageTreeNode,
} from "../config/profile-config";
import styles from "../styles/profile-lineage-tree.module.scss";

function ProfileLineageTreeNodeItem({
  node,
}: Readonly<{
  node: ProfileLineageTreeNode;
}>) {
  return (
    <li className={styles.treeItem}>
      <article className={styles.nodeCard}>
        <p className={styles.nodeRelation}>{node.relation}</p>
        <p className={styles.nodeName}>{node.name}</p>
        <p className={styles.nodeMeta}>Born: {node.born}</p>
        <p className={styles.nodeStatus}>{node.status}</p>
      </article>

      {node.children && node.children.length > 0 ? (
        <ul className={styles.treeList}>
          {node.children.map((childNode) => (
            <ProfileLineageTreeNodeItem key={childNode.id} node={childNode} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function ProfileLineageTree({
  treeData,
}: Readonly<{
  treeData: ProfileLineageTreeData;
}>) {
  return (
    <div className="mt-5">
      <p className="text-[13px] leading-5 text-[#5f7174] sm:text-[14px]">
        {treeData.description}
      </p>
      <div className={styles.treeScroller}>
        <div className={styles.treeCanvas}>
          <ul className={styles.treeList}>
            {treeData.roots.map((rootNode) => (
              <ProfileLineageTreeNodeItem key={rootNode.id} node={rootNode} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
