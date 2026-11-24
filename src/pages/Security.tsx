import { Plate } from "../components/Plate";
import { BulletList, Cta, Note, PageHeader, Section, TextLink } from "../components/ui";

export function Security() {
  return (
    <>
      <PageHeader
        title="Boundaries by design, claims kept small."
        lede="Isolation, policy application, teardown verification and receipt integrity are the security model. None of them adds up to a guarantee, and this page does not pretend otherwise."
        plate="/images/plate-prove.webp"
        plateLabel="Security"
      />

      <Section
        title="Security model."
        lede="Four properties the execution record is built to describe."
      >
        <BulletList
          items={[
            "The environment a run starts from is declared, not inherited.",
            "Filesystem, process and network boundaries are applied before execution.",
            "Activity during the run is recorded as it happens.",
            "Teardown is verified and the result is recorded, including failures.",
          ]}
        />
        <p className="text-[14px] leading-relaxed text-muted">
          A receipt describes those properties for one execution. It is evidence about the run, not
          a statement about the security of the software itself.
        </p>
      </Section>

      <Section
        title="Isolation."
        lede="What the execution can touch is configuration."
      >
        <p>
          Executions run with declared filesystem, process and network boundaries. The boundaries are
          established before the first command and described in the record, so a reviewer can see
          what the run was permitted to do.
        </p>
        <p className="text-[14px] leading-relaxed text-muted">
          Isolation limits exposure. It does not eliminate the possibility of a defect in the
          isolation layer, and Workflo does not claim it does.
        </p>
      </Section>

      <Section
        title="Policy controls."
        lede="A policy set is attached to an execution and its application is recorded."
      >
        <p>
          Policies describe permitted actions and required records for a run. Because they travel
          with the execution definition, they are reviewable in the repository alongside the code
          they constrain.
        </p>
        <Note>
          This page does not describe a compliance certification. Workflo does not claim
          certifications it has not obtained.
        </Note>
      </Section>

      <Section
        title="Teardown verification."
        lede="Cleanup is checked, not assumed."
      >
        <p>
          Processes started by the execution, mounts it created and temporary state it wrote are
          checked after the run. A failed check is recorded as a failed check; it is not smoothed over
          in the receipt.
        </p>
      </Section>

      <Section
        title="Evidence integrity."
        lede="The record is useful only if it can be trusted to be the record."
      >
        <p>
          Execution activity is recorded into a ledger with the execution context attached. The
          receipt is signed so its integrity can be verified later. Integrity of the record is a
          narrower claim than correctness of the software.
        </p>
        <BulletList
          items={[
            "The receipt covers one execution and its recorded activity.",
            "A signature protects the integrity of that record.",
            "A receipt does not prove that the software is correct.",
          ]}
        />
      </Section>

      <Section
        title="Signed receipts."
        lede="What the signature does, and what it does not do."
      >
        <p>
          A signature lets a reviewer check that the receipt has not been modified since it was
          produced. It does not validate the decisions the execution made, the quality of the tests,
          or the absence of defects.
        </p>
      </Section>

      <Section
        title="Privacy boundaries."
        lede="Where source code does and does not travel."
      >
        <p>
          Source code is not sent to hosted inference through the Workflo inference pathway. The CLI
          is designed to run in the environment you control; the hosted platform is an optional
          surface for reviewing executions.
        </p>
        <p className="text-[13px] leading-relaxed text-muted/80">
          This page states only the boundaries that are part of the design. It makes no broader
          privacy claims.
        </p>
      </Section>

      <Section
        title="Responsible limitations."
        lede="Stated once, plainly."
      >
        <BulletList
          items={[
            "No absolute security is claimed.",
            "No compliance certification is claimed.",
            "No guarantee of protection from every risk is claimed.",
            "A signed receipt does not prove software correctness.",
            "Agents do not decide whether software is safe to release.",
          ]}
        />
        <p className="text-[14px] leading-relaxed text-muted">
          The <TextLink to="/docs#security">security documentation</TextLink> restates these
          boundaries next to the configuration model.
        </p>
      </Section>

      <Plate
        src="/images/plate-verify.webp"
        label="Verify"
        index="01 / 02"
        caption="Policy applied, isolation enforced, teardown checked — and recorded either way."
        meta={["policy", "isolation", "teardown", "integrity"]}
        className="min-h-[56vh]"
      />

      <section>
        <div className="shell flex flex-wrap items-center justify-between gap-6 py-14">
          <h2 className="h-sub max-w-[32ch]">Read the model before you rely on the receipt.</h2>
          <div className="flex flex-wrap gap-2.5">
            <Cta to="/docs#security">Security docs</Cta>
            <Cta to="/early-access" variant="ghost">
              Request early access
            </Cta>
          </div>
        </div>
      </section>
    </>
  );
}
