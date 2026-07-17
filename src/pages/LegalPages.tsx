// Páginas jurídicas PÚBLICAS (sem autenticação) exigidas pela Meta para aprovar
// a integração com a WhatsApp Business Platform: Política de Privacidade e Termos
// de Serviço. Precisam ser acessíveis por URL fixa e sem login, pois o rastreador
// da Meta não faz autenticação.
//
// Rotas registradas em App.tsx (bloco isPublicRoute): /privacidade e /termos.

import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "../components/Logo";
import { brandConfig } from "../lib/branding";

// Dados do controlador (mesma fonte do rodapé da Landing).
const COMPANY = {
  brand: brandConfig.name,
  legalName: "LEONARDO FERRAZ DA SILVA BRASIL",
  cnpj: "65.993.728/0001-07",
  email: "funil@funilcomercial.com",
  site: "https://funilcomercial.com",
};

const LAST_UPDATE = "9 de julho de 2026";

function LegalLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <Link to="/">
            <Logo iconSize={32} />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar ao site
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Última atualização: {LAST_UPDATE}
          </p>
          <div className="legal-prose space-y-6 text-sm md:text-base leading-relaxed text-muted-foreground">
            {children}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-background py-8">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {COMPANY.brand}. Todos os direitos
            reservados.
          </p>
          <div className="flex gap-6">
            <Link to="/termos" className="hover:text-primary transition-colors">
              Termos de Serviço
            </Link>
            <Link
              to="/privacidade"
              className="hover:text-primary transition-colors"
            >
              Política de Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Título de seção padronizado.
function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl md:text-2xl font-bold text-foreground pt-4">
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base md:text-lg font-semibold text-foreground pt-2">
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-6 space-y-2">{children}</ul>;
}

const mail = (
  <a
    href={`mailto:${COMPANY.email}`}
    className="text-primary hover:underline"
  >
    {COMPANY.email}
  </a>
);

export function PrivacyPage() {
  return (
    <LegalLayout title="Política de Privacidade">
      <P>
        Esta Política de Privacidade descreve como o {COMPANY.brand} (marca
        operada por {COMPANY.legalName}, inscrita no CNPJ nº {COMPANY.cnpj},
        doravante "nós", "nosso" ou "Plataforma") coleta, usa, armazena,
        compartilha e protege dados pessoais, em conformidade com a Lei nº
        13.709/2018 (Lei Geral de Proteção de Dados — LGPD) e com as políticas da
        Meta Platforms, Inc. aplicáveis à WhatsApp Business Platform.
      </P>
      <P>
        Ao utilizar a Plataforma, disponível em {COMPANY.site}, você declara
        estar ciente e de acordo com esta Política.
      </P>

      <H2>1. Quem é o controlador dos dados</H2>
      <P>
        O controlador dos dados pessoais tratados nesta Plataforma é{" "}
        {COMPANY.legalName}, CNPJ {COMPANY.cnpj}. Para qualquer questão relativa a
        privacidade e proteção de dados, entre em contato pelo e-mail {mail}.
      </P>

      <H2>2. Dados que coletamos</H2>
      <H3>2.1. Dados de cadastro do usuário</H3>
      <UL>
        <li>Nome e sobrenome;</li>
        <li>Endereço de e-mail;</li>
        <li>Número de telefone;</li>
        <li>Credenciais de acesso (senha armazenada de forma criptografada);</li>
        <li>Dados de perfil e preferências de uso da Plataforma.</li>
      </UL>

      <H3>2.2. Dados de clientes e contatos inseridos por você</H3>
      <P>
        A Plataforma é uma ferramenta de CRM. Ao utilizá-la, você (usuário) pode
        inserir e gerenciar dados de terceiros (seus contatos, leads e clientes),
        tais como nome, telefone, e-mail, origem, histórico de conversas e
        anotações comerciais. Nesse tratamento, você atua como controlador desses
        dados e nós atuamos como operador, tratando-os exclusivamente conforme suas
        instruções e para o funcionamento do serviço.
      </P>

      <H3>2.3. Dados da integração com o WhatsApp</H3>
      <P>
        Quando você conecta um número de WhatsApp por meio da WhatsApp Business
        Platform (API Oficial da Meta) ou de provedores compatíveis, tratamos:
      </P>
      <UL>
        <li>
          Número de telefone da conta WhatsApp Business conectada e identificadores
          técnicos (por exemplo, Phone Number ID e identificador da conta
          comercial);
        </li>
        <li>
          Conteúdo das mensagens enviadas e recebidas (texto, mídia e metadados como
          data, hora e status de entrega), a fim de exibi-las na caixa de entrada e
          vinculá-las ao contato/lead correspondente;
        </li>
        <li>Nome de exibição do remetente informado pelo WhatsApp.</li>
      </UL>
      <P>
        Esses dados são utilizados unicamente para prestar o serviço de
        atendimento e gestão comercial que você contratou, e são tratados em
        conformidade com os Termos da Plataforma do WhatsApp Business e demais
        políticas da Meta.
      </P>

      <H3>2.4. Dados técnicos e de uso</H3>
      <UL>
        <li>Endereço IP, tipo de navegador e dispositivo;</li>
        <li>Registros de acesso e de eventos (logs);</li>
        <li>Cookies e tecnologias similares estritamente necessárias ao funcionamento.</li>
      </UL>

      <H2>3. Finalidades e bases legais do tratamento</H2>
      <P>Tratamos dados pessoais para as seguintes finalidades:</P>
      <UL>
        <li>
          <strong>Execução do contrato</strong> (art. 7º, V, LGPD): criar e manter
          sua conta, prestar as funcionalidades de CRM, enviar e receber mensagens
          de WhatsApp e exibir o histórico comercial;
        </li>
        <li>
          <strong>Legítimo interesse</strong> (art. 7º, IX, LGPD): melhorar a
          segurança, prevenir fraudes e aprimorar a Plataforma;
        </li>
        <li>
          <strong>Cumprimento de obrigação legal ou regulatória</strong> (art. 7º,
          II, LGPD);
        </li>
        <li>
          <strong>Consentimento</strong> (art. 7º, I, LGPD), quando aplicável.
        </li>
      </UL>

      <H2>4. Compartilhamento de dados</H2>
      <P>
        Não vendemos dados pessoais. Compartilhamos dados apenas com prestadores
        de serviço (operadores) estritamente necessários ao funcionamento da
        Plataforma, entre eles:
      </P>
      <UL>
        <li>
          <strong>Meta Platforms, Inc.</strong> — para envio e recebimento de
          mensagens por meio da WhatsApp Business Platform;
        </li>
        <li>
          <strong>Google LLC</strong> — para medição de tráfego, análise de jornada (Google Analytics e Google Signals) e personalização de campanhas publicitárias (Google Ads), incluindo o envio de conversões (Enhanced Conversions) de forma anônima e criptografada (hash);
        </li>
        <li>
          <strong>Supabase</strong> — provedor de banco de dados e infraestrutura
          onde os dados são armazenados de forma segura;
        </li>
        <li>
          <strong>Provedor de hospedagem</strong> do site e da aplicação;
        </li>
        <li>
          Autoridades públicas, quando exigido por lei ou ordem judicial.
        </li>
      </UL>
      <P>
        Todos os operadores são contratualmente obrigados a tratar os dados
        exclusivamente para as finalidades aqui descritas e a adotar medidas de
        segurança adequadas.
      </P>

      <H2>5. Armazenamento, segurança e transferência internacional</H2>
      <P>
        Adotamos medidas técnicas e organizacionais para proteger os dados contra
        acesso não autorizado, perda ou alteração, incluindo criptografia em
        trânsito, controle de acesso e isolamento de dados por usuário. Alguns
        operadores podem armazenar dados em servidores localizados fora do Brasil;
        nesses casos, garantimos que a transferência internacional observe os
        requisitos da LGPD.
      </P>

      <H2>6. Retenção de dados</H2>
      <P>
        Mantemos os dados pessoais pelo tempo necessário ao cumprimento das
        finalidades para as quais foram coletados, enquanto sua conta estiver
        ativa, ou pelo prazo exigido por obrigações legais. Encerrada a conta ou
        atendida a solicitação de exclusão, os dados são eliminados ou anonimizados,
        salvo hipóteses de guarda obrigatória previstas em lei.
      </P>

      <H2>7. Direitos do titular dos dados</H2>
      <P>Nos termos da LGPD, você pode, a qualquer momento:</P>
      <UL>
        <li>Confirmar a existência de tratamento e acessar seus dados;</li>
        <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
        <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários;</li>
        <li>Solicitar a portabilidade dos dados;</li>
        <li>Revogar o consentimento;</li>
        <li>Opor-se a tratamento realizado com base em legítimo interesse.</li>
      </UL>

      <H2>8. Como excluir seus dados</H2>
      <P>
        Você pode solicitar a exclusão dos seus dados pessoais e da sua conta a
        qualquer momento enviando um e-mail para {mail} com o assunto "Exclusão de
        dados". Atenderemos a solicitação no prazo previsto na legislação
        aplicável. Também é possível excluir individualmente contatos, leads e
        oportunidades diretamente na Plataforma.
      </P>

      <H2>9. Cookies</H2>
      <P>
        Utilizamos cookies e tecnologias similares estritamente necessárias para
        autenticação e funcionamento da Plataforma, bem como cookies de terceiros (como os do Google Analytics e Google Ads) para medir a performance do site e personalizar anúncios e campanhas. Ao aceitar nosso Banner de Cookies, você consente com o uso dessas tecnologias de medição e publicidade. Você pode gerenciá-los nas
        configurações do seu navegador; a desativação dos cookies essenciais pode comprometer o
        funcionamento do serviço.
      </P>

      <H2>10. Menores de idade</H2>
      <P>
        A Plataforma é destinada a profissionais e empresas. Não coletamos
        intencionalmente dados de menores de 18 anos. Caso identifiquemos tal
        coleta, os dados serão eliminados.
      </P>

      <H2>11. Alterações desta Política</H2>
      <P>
        Podemos atualizar esta Política periodicamente. A versão vigente estará
        sempre disponível nesta página, com a data da última atualização indicada
        no topo. Alterações relevantes poderão ser comunicadas por e-mail ou na
        própria Plataforma.
      </P>

      <H2>12. Contato e Encarregado (DPO)</H2>
      <P>
        Para exercer seus direitos ou esclarecer dúvidas sobre esta Política e o
        tratamento de dados pessoais, entre em contato pelo e-mail {mail}.
      </P>
    </LegalLayout>
  );
}

export function DataDeletionPage() {
  return (
    <LegalLayout title="Exclusão de Dados do Usuário">
      <P>
        Nós, do {COMPANY.brand} (marca operada por {COMPANY.legalName}, CNPJ nº{" "}
        {COMPANY.cnpj}), respeitamos o seu direito de controlar seus dados pessoais.
        Esta página explica como solicitar a exclusão dos seus dados da nossa
        Plataforma, disponível em {COMPANY.site}, incluindo os dados obtidos por meio
        da integração com o WhatsApp Business Platform (Meta).
      </P>

      <H2>1. Quais dados podem ser excluídos</H2>
      <UL>
        <li>Dados da sua conta (nome, e-mail, telefone e preferências);</li>
        <li>Contatos, leads e oportunidades cadastrados por você na Plataforma;</li>
        <li>
          Histórico de mensagens de WhatsApp (texto, mídia e metadados) associado à
          sua conta;
        </li>
        <li>Registros de acesso e uso vinculados à sua conta.</li>
      </UL>

      <H2>2. Excluir dados diretamente na Plataforma</H2>
      <P>
        Estando autenticado, você pode excluir individualmente contatos, leads e
        oportunidades a qualquer momento, utilizando o botão de exclusão disponível
        em cada registro nas páginas Contatos, Leads e Funil de Vendas.
      </P>

      <H2>3. Solicitar a exclusão total da conta e dos dados</H2>
      <P>
        Para solicitar a exclusão completa da sua conta e de todos os dados
        associados, siga os passos abaixo:
      </P>
      <UL>
        <li>
          Envie um e-mail para {mail} a partir do endereço de e-mail cadastrado na
          sua conta;
        </li>
        <li>
          Utilize o assunto: <strong>"Exclusão de dados"</strong>;
        </li>
        <li>
          Informe o nome da conta e, se aplicável, o número de WhatsApp conectado,
          para que possamos localizar e remover seus dados.
        </li>
      </UL>
      <P>
        Após a confirmação da sua identidade, processaremos a exclusão e removeremos
        ou anonimizaremos seus dados pessoais no prazo previsto na legislação
        aplicável (LGPD), ressalvadas as hipóteses de guarda obrigatória por lei.
        Você receberá uma confirmação por e-mail quando a exclusão for concluída.
      </P>

      <H2>4. Prazo</H2>
      <P>
        As solicitações de exclusão são atendidas em até 30 (trinta) dias, contados
        da confirmação da sua identidade.
      </P>

      <H2>5. Contato</H2>
      <P>
        Em caso de dúvidas sobre a exclusão dos seus dados, entre em contato pelo
        e-mail {mail}. Consulte também a nossa{" "}
        <Link to="/privacidade" className="text-primary hover:underline">
          Política de Privacidade
        </Link>
        .
      </P>
    </LegalLayout>
  );
}

export function TermsPage() {
  return (
    <LegalLayout title="Termos de Serviço">
      <P>
        Estes Termos de Serviço ("Termos") regem o uso da plataforma {COMPANY.brand}{" "}
        (marca operada por {COMPANY.legalName}, CNPJ nº {COMPANY.cnpj}),
        disponível em {COMPANY.site} ("Plataforma"). Ao criar uma conta ou utilizar
        a Plataforma, você ("Usuário") concorda integralmente com estes Termos.
      </P>

      <H2>1. Descrição do serviço</H2>
      <P>
        O {COMPANY.brand} é uma plataforma de CRM (gestão de relacionamento com o
        cliente) que permite organizar contatos, leads, oportunidades e um funil de
        vendas, além de enviar e receber mensagens por meio de integrações com o
        WhatsApp, incluindo a WhatsApp Business Platform (API Oficial da Meta).
      </P>

      <H2>2. Cadastro e conta</H2>
      <UL>
        <li>
          Para utilizar a Plataforma é necessário criar uma conta com informações
          verdadeiras, completas e atualizadas;
        </li>
        <li>
          Você é responsável por manter a confidencialidade de suas credenciais e
          por todas as atividades realizadas em sua conta;
        </li>
        <li>
          A conta é pessoal e intransferível; você deve notificar-nos imediatamente
          sobre qualquer uso não autorizado.
        </li>
      </UL>

      <H2>3. Uso aceitável</H2>
      <P>Ao utilizar a Plataforma, você concorda em NÃO:</P>
      <UL>
        <li>
          Enviar mensagens não solicitadas (spam), conteúdo enganoso, ilegal,
          ofensivo ou que viole direitos de terceiros;
        </li>
        <li>
          Utilizar a Plataforma para qualquer finalidade ilícita ou que viole a
          legislação aplicável;
        </li>
        <li>
          Tentar acessar, comprometer ou interferir na segurança ou na
          infraestrutura da Plataforma;
        </li>
        <li>
          Realizar engenharia reversa, copiar ou revender o serviço sem autorização.
        </li>
      </UL>

      <H2>4. Integração com o WhatsApp e responsabilidades do Usuário</H2>
      <P>
        Ao conectar um número por meio da WhatsApp Business Platform, você concorda
        e se compromete a:
      </P>
      <UL>
        <li>
          Cumprir integralmente os Termos da Plataforma do WhatsApp Business, as
          Políticas de Mensagens do WhatsApp e demais políticas da Meta Platforms,
          Inc.;
        </li>
        <li>
          Obter o consentimento prévio e adequado dos destinatários antes de
          enviar-lhes mensagens, conforme exigido pela Meta e pela LGPD;
        </li>
        <li>
          Ser o único responsável pelo conteúdo das mensagens que enviar e pelo
          relacionamento com seus contatos;
        </li>
        <li>
          Respeitar as solicitações de descadastramento (opt-out) dos destinatários.
        </li>
      </UL>
      <P>
        O descumprimento das políticas da Meta pode resultar na suspensão do seu
        número pela própria Meta, sem que possamos interferir nessa decisão.
      </P>

      <H2>5. Dados e privacidade</H2>
      <P>
        O tratamento de dados pessoais no âmbito da Plataforma é regido pela nossa{" "}
        <Link to="/privacidade" className="text-primary hover:underline">
          Política de Privacidade
        </Link>
        , que integra estes Termos. Você é responsável por tratar os dados de seus
        contatos em conformidade com a LGPD.
      </P>

      <H2>6. Propriedade intelectual</H2>
      <P>
        Todo o software, marca, layout, textos e demais elementos da Plataforma são
        de titularidade de {COMPANY.legalName} ou de seus licenciadores, protegidos
        pela legislação de propriedade intelectual. Os dados que você insere
        permanecem de sua titularidade.
      </P>

      <H2>7. Planos, pagamentos e cancelamento</H2>
      <P>
        Caso a Plataforma ofereça planos pagos, as condições, valores e formas de
        pagamento serão informados no momento da contratação. Você pode cancelar sua
        conta a qualquer momento; o cancelamento encerra o acesso às funcionalidades
        associadas.
      </P>

      <H2>8. Limitação de responsabilidade</H2>
      <P>
        A Plataforma é fornecida "no estado em que se encontra". Na máxima extensão
        permitida em lei, não nos responsabilizamos por danos indiretos, lucros
        cessantes, indisponibilidades de serviços de terceiros (incluindo a Meta e o
        WhatsApp) ou pelo uso indevido da Plataforma pelo Usuário. Empregamos
        esforços razoáveis para manter o serviço disponível e seguro, mas não
        garantimos operação ininterrupta ou livre de erros.
      </P>

      <H2>9. Suspensão e rescisão</H2>
      <P>
        Podemos suspender ou encerrar o acesso à Plataforma em caso de violação
        destes Termos, de exigência legal ou de uso que comprometa a segurança do
        serviço ou de terceiros.
      </P>

      <H2>10. Alterações dos Termos</H2>
      <P>
        Podemos modificar estes Termos a qualquer momento. A versão vigente estará
        sempre disponível nesta página. O uso continuado da Plataforma após
        eventuais alterações implica concordância com os novos Termos.
      </P>

      <H2>11. Lei aplicável e foro</H2>
      <P>
        Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica
        eleito o foro do domicílio do Usuário para dirimir eventuais controvérsias,
        salvo disposição legal em contrário.
      </P>

      <H2>12. Contato</H2>
      <P>
        Em caso de dúvidas sobre estes Termos, entre em contato pelo e-mail {mail}.
      </P>
    </LegalLayout>
  );
}
