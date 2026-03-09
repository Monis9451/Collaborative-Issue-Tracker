'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useOrganizations } from '@/hooks/useOrganizations'
import { OrgSection } from '@/components/dashboard/org/OrgSection'
import { OrgEmptyState } from '@/components/dashboard/org/OrgEmptyState'
import {
  CreateOrgModal,
  NewOrgButton,
  ProminentCreateButton,
} from '@/components/dashboard/org/CreateOrgModal'
import { DeleteOrgModal } from '@/components/dashboard/org/DeleteOrgModal'
import { Spinner } from '@/components/ui/spinner'
import type { OrgWithRole } from '@/hooks/useOrganizations'


const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const sectionVariant = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

export function OrgsDashboard() {
  const [modalOpen,    setModalOpen]    = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<OrgWithRole | null>(null)

  const {
    adminOrgs,
    memberOrgs,
    totalCount,
    isLoading,
    isError,
    error,
  } = useOrganizations()

  // ── Loading ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-32">
        <Spinner size="lg" label="Loading organizations…" />
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center py-32 text-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-semibold text-danger">Failed to load organizations</p>
          <p className="text-xs text-text-muted">{(error as Error).message}</p>
        </div>
      </div>
    )
  }

  // ── Empty state ───────────────────────────────────────────
  if (totalCount === 0) {
    return (
      <>
        <OrgEmptyState
          action={<ProminentCreateButton onClick={() => setModalOpen(true)} />}
        />
        <CreateOrgModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    )
  }

  // ── Has orgs ──────────────────────────────────────────────
  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-10"
      >
        {/* Admin organizations */}
        {adminOrgs.length > 0 && (
          <motion.div variants={sectionVariant}>
            <OrgSection
              title="My Organizations"
              orgs={adminOrgs}
              action={<NewOrgButton onClick={() => setModalOpen(true)} />}
              onDeleteClick={setDeleteTarget}
            />
          </motion.div>
        )}

        {/* Member organizations */}
        {memberOrgs.length > 0 && (
          <motion.div variants={sectionVariant}>
            <OrgSection
              title="Member Of"
              orgs={memberOrgs}
            />
          </motion.div>
        )}

        {/* If user has no admin orgs, put the create button at the top */}
        {adminOrgs.length === 0 && (
          <motion.div variants={sectionVariant} className="flex">
            <ProminentCreateButton onClick={() => setModalOpen(true)} />
          </motion.div>
        )}
      </motion.div>

      <CreateOrgModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Delete confirmation modal */}
      <DeleteOrgModal
        open={deleteTarget !== null}
        orgId={deleteTarget?.organization.id ?? ''}
        orgName={deleteTarget?.organization.name ?? ''}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  )
}
